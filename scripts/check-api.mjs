import assert from 'node:assert/strict'

const base = (process.env.NEXT_PUBLIC_API_URL || 'https://jsonplaceholder.typicode.com').replace(
    /\/$/,
    ''
)
async function request(path, options) {
    return fetch(base + path, { ...options, signal: AbortSignal.timeout(15000) })
}
for (const [page, limit] of [
    [1, 10],
    [2, 5],
    [5, 20],
]) {
    const response = await request('/posts?_page=' + page + '&_limit=' + limit)
    assert.equal(response.status, 200)
    const posts = await response.json()
    assert.equal(posts.length, limit)
    assert.equal(posts[0].id, (page - 1) * limit + 1)
    assert.equal(response.headers.get('x-total-count'), '100')
}
const posts = await (await request('/posts')).json()
const users = await (await request('/users')).json()
assert.equal(posts.length, 100)
assert.equal(users.length, 10)
const post = await (await request('/posts/1')).json()
const user = await (await request('/users/' + post.userId)).json()
assert.equal(user.id, post.userId)
assert.equal((await request('/posts/999999')).status, 404)
const payload = {
    title: 'API smoke test',
    body: 'Simulated post; no persistence expected.',
    userId: 1,
}
const created = await request('/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(payload),
})
assert.equal(created.status, 201)
assert.deepEqual(await created.json(), { ...payload, id: 101 })
console.log('Live API checks passed: pagination, users, detail, 404, simulated POST 201.')
