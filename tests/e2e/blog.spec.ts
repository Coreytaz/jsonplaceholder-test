import { test, expect, type Page } from '@playwright/test'

const posts = Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    userId: (index % 10) + 1,
    title: 'Post ' + (index + 1),
    body: 'Body of post ' + (index + 1),
}))
const users = Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    name: 'Author ' + (index + 1),
    username: 'author' + (index + 1),
}))

async function mockApi(page: Page) {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
        if (message.type() === 'error' && /hydration|hooks|mobx/i.test(message.text()))
            errors.push(message.text())
    })
    await page.route('https://loremflickr.com/**', (route) => route.abort())
    await page.route('**/posts**', async (route) => {
        const request = route.request()
        const url = new URL(request.url())
        if (request.method() === 'POST') {
            return route.fulfill({ status: 201, json: { ...request.postDataJSON(), id: 101 } })
        }
        const id = url.pathname.match(/posts\/(.+)$/)?.[1]
        if (id) {
            const post = posts.find((item) => item.id === Number(id))
            return route.fulfill({ status: post ? 200 : 404, json: post ?? {} })
        }
        const limit = Number(url.searchParams.get('_limit') || 100)
        const start = (Number(url.searchParams.get('_page') || 1) - 1) * limit
        return route.fulfill({
            status: 200,
            headers: { 'x-total-count': '100', 'access-control-expose-headers': 'X-Total-Count' },
            json: posts.slice(start, start + limit),
        })
    })
    await page.route('**/users**', (route) => {
        const id = new URL(route.request().url()).pathname.match(/users\/(.+)$/)?.[1]
        return route.fulfill({ json: id ? users.find((user) => user.id === Number(id)) : users })
    })
    return errors
}

test('direct URL, limit reset, Back/Forward and detail navigation', async ({ page }) => {
    const errors = await mockApi(page)
    await page.goto('/?page=2&limit=5')
    await expect(page.getByRole('article')).toHaveCount(5)
    await expect(page.getByRole('link', { name: 'Post 6', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Page 2', exact: true })).toHaveAttribute(
        'aria-current',
        'page'
    )
    await page.getByRole('button', { name: 'Page 3', exact: true }).click()
    await expect(page.getByRole('link', { name: 'Post 11', exact: true })).toBeVisible()
    await page.goBack()
    await expect(page.getByRole('link', { name: 'Post 6', exact: true })).toBeVisible()
    await page.goForward()
    await expect(page.getByRole('link', { name: 'Post 11', exact: true })).toBeVisible()
    await page.getByRole('combobox', { name: 'Posts per page' }).selectOption('20')
    await expect(page).toHaveURL(/page=1&limit=20/)
    await expect(page.getByRole('article')).toHaveCount(20)
    await page.getByRole('link', { name: 'Post 1', exact: true }).click()
    await expect(page).toHaveURL('/blog/1')
    await expect(page.getByRole('heading', { name: 'Post 1', exact: true })).toBeVisible()
    await expect(page.getByText('Author 1', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await expect(page.getByRole('article')).toHaveCount(20)
    expect(errors).toEqual([])
})

test('normalizes malformed and out-of-range pagination', async ({ page }) => {
    await mockApi(page)
    await page.goto('/?page=-1&limit=7')
    await expect(page).toHaveURL(/page=1&limit=10/)
    await expect(page.getByRole('article')).toHaveCount(10)
    await page.goto('/?page=999&limit=20')
    await expect(page).toHaveURL(/page=5&limit=20/)
    await expect(page.getByRole('link', { name: 'Post 81', exact: true })).toBeVisible()
})

test('404 for absent post and malformed id, retry for network failure', async ({ page }) => {
    const errors = await mockApi(page)
    for (const path of ['/blog/999', '/blog/abc', '/missing']) {
        await page.goto(path)
        await expect(page.getByRole('heading', { name: '404', exact: true })).toBeVisible()
    }
    let failed = true
    await page.route('**/posts/1', (route) =>
        failed ? route.abort('failed') : route.fulfill({ json: posts[0] })
    )
    await page.goto('/blog/1')
    await expect(page.getByRole('alert').filter({ hasText: 'Unable to load data' })).toBeVisible()
    failed = false
    await page.getByRole('button', { name: 'Try again' }).click()
    await expect(page.getByRole('heading', { name: 'Post 1', exact: true })).toBeVisible()
    expect(errors).toEqual([])
})

test('list failure has a working retry', async ({ page }) => {
    await mockApi(page)
    let failed = true
    await page.route('**/posts?**', async (route) => {
        if (failed) return route.abort('failed')
        return route.fallback()
    })
    await page.goto('/')
    await expect(page.getByRole('alert').filter({ hasText: 'Unable to load data' })).toBeVisible()
    failed = false
    await page.getByRole('button', { name: 'Try again' }).click()
    await expect(page.getByRole('article')).toHaveCount(10)
})

test('validates form, keeps values on error, prevents duplicate POST and resets after success', async ({
    page,
}) => {
    const errors = await mockApi(page)
    let calls = 0
    let fail = true
    await page.route('**/posts', async (route) => {
        if (route.request().method() !== 'POST') return route.fallback()
        calls++
        expect(route.request().postDataJSON()).toEqual({
            title: 'New title',
            body: 'New body',
            userId: 1,
        })
        if (fail) return route.fulfill({ status: 500, json: {} })
        await new Promise((resolve) => setTimeout(resolve, 350))
        return route.fulfill({ status: 201, json: { ...route.request().postDataJSON(), id: 101 } })
    })
    await page.goto('/')
    await page.getByRole('button', { name: 'Create blog', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toContainText('does not save new posts')
    await dialog.getByRole('button', { name: 'Create', exact: true }).click()
    await expect(dialog.getByText('The field cannot be empty')).toHaveCount(2)
    await dialog.getByRole('textbox', { name: 'Blog title' }).fill('   ')
    await dialog.getByRole('button', { name: 'Create', exact: true }).click()
    expect(calls).toBe(0)
    await dialog.getByRole('textbox', { name: 'Blog title' }).fill(' New title ')
    await dialog.getByRole('textbox', { name: 'Text blog' }).fill(' New body ')
    await dialog.getByRole('button', { name: 'Create', exact: true }).click()
    await expect(page.getByText('Unable to create blog', { exact: true })).toBeVisible()
    await expect(dialog.getByRole('textbox', { name: 'Blog title' })).toHaveValue(' New title ')
    fail = false
    await dialog.getByRole('button', { name: 'Create', exact: true }).click()
    await expect(dialog.getByRole('button', { name: 'Create', exact: true })).toBeDisabled()
    await expect(dialog).not.toBeVisible()
    await expect(page.getByText('Blog creation simulated', { exact: true })).toBeVisible()
    expect(calls).toBe(2)
    await page.getByRole('button', { name: 'Create blog', exact: true }).click()
    await expect(dialog.getByRole('textbox', { name: 'Blog title' })).toHaveValue('')
    expect(errors).toEqual([])
})

test('theme persists, images fall back, and layout fits the viewport', async ({
    page,
}, testInfo) => {
    const errors = await mockApi(page)
    await page.goto('/')
    await expect(page.getByRole('article')).toHaveCount(10)
    await expect(page.getByRole('article').first().getByRole('img')).toHaveAttribute(
        'src',
        '/cover-placeholder.svg'
    )
    await page.getByRole('button', { name: 'Toggle color mode' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await page.reload()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.getByRole('article')).toHaveCount(10)
    expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true)
    await page.screenshot({ path: testInfo.outputPath('blog-dark.png'), fullPage: true })
    await page.getByRole('button', { name: 'Toggle color mode' }).click()
    await expect(page.locator('html')).toHaveClass(/light/)
    await page.screenshot({ path: testInfo.outputPath('blog-light.png'), fullPage: true })
    expect(errors).toEqual([])
})
