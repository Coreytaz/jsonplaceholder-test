import { describe, expect, it } from 'vitest'
import { parsePagination } from '@/shared/hook/useQueryParam'

describe('URL pagination', () => {
    it('defaults to page 1 and ten posts', () => {
        expect(parsePagination({})).toEqual({ page: 1, limit: 10 })
    })
    it('accepts supported values', () => {
        expect(parsePagination({ page: '12', limit: '5' })).toEqual({ page: 12, limit: 5 })
    })
    it.each(['0', '-1', '1.5', '1e2', 'Infinity', 'NaN', '9007199254740992', ''])(
        'normalizes invalid page %s',
        (page) => {
            expect(parsePagination({ page }).page).toBe(1)
        }
    )
    it('normalizes arrays and unsupported limits', () => {
        expect(parsePagination({ page: ['1', '2'], limit: '7' })).toEqual({ page: 1, limit: 10 })
        expect(parsePagination({ limit: ['5'] }).limit).toBe(10)
    })
})
