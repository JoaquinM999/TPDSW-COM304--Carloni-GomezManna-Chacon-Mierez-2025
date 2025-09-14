import request from 'supertest';
import app from '../src/app';
import axios from 'axios';

// Use the mocked axios from setup.ts
const mockedAxios = jest.mocked(axios);

describe('External Author API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/external-authors/search-author', () => {
    it('should return paginated authors with unique names', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          docs: [
            { key: '/authors/OL1A', name: 'Shakespeare' },
            { key: '/authors/OL2A', name: 'Author Two' },
          ],
          numFound: 2,
        },
      });

      mockedAxios.get.mockResolvedValue({
        data: { photos: [123] },
      });

      const res = await request(app)
        .get('/api/external-authors/search-author')
        .query({ name: 'Shakespeare', page: 1, limit: 5 })
        .expect(200);

      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page', 1);
      expect(res.body).toHaveProperty('limit', 5);
      expect(Array.isArray(res.body.authors)).toBe(true);
      expect(res.body.authors.length).toBeLessThanOrEqual(5);

      // Check for unique author names
      const names = res.body.authors.map((a: any) => a.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('should return empty array if page exceeds data', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          docs: [],
          numFound: 0,
        },
      });

      const res = await request(app)
        .get('/api/external-authors/search-author')
        .query({ name: 'Shakespeare', page: 1000, limit: 10 })
        .expect(200);

      expect(res.body.authors).toEqual([]);
    });

    it('should return 400 if name parameter is missing', async () => {
      const res = await request(app)
        .get('/api/external-authors/search-author')
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Expanded External Author API Tests', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('GET /api/external-authors/search-author expanded', () => {
      it('should filter duplicates and paginate correctly', async () => {
        mockedAxios.get.mockResolvedValueOnce({
          data: {
            docs: [
              { key: '/authors/OL1A', name: 'Author One' },
              { key: '/authors/OL2A', name: 'Author Two' },
              { key: '/authors/OL3A', name: 'Author One' }, // duplicate
              { key: '/authors/OL4A', name: 'Author Four' },
              { key: '/authors/OL5A', name: 'Author Five' },
              { key: '/authors/OL6A', name: 'Author Six' },
            ],
            numFound: 6,
          },
        });

        mockedAxios.get.mockResolvedValue({
          data: { photos: [123] },
        });

        const res = await request(app)
          .get('/api/external-authors/search-author')
          .query({ name: 'Test', page: 1, limit: 5 })
          .expect(200);

        expect(res.body.total).toBe(5);
        expect(res.body.authors.length).toBeLessThanOrEqual(5);
        const names = res.body.authors.map((a: any) => a.name);
        const uniqueNames = new Set(names);
        expect(uniqueNames.size).toBe(names.length);
      });

      it('should handle API failure gracefully', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('API failure'));

        const res = await request(app)
          .get('/api/external-authors/search-author')
          .query({ name: 'Test' })
          .expect(500);

        expect(res.body).toHaveProperty('error');
      });

      it('should retry on 429 rate limit error', async () => {
        const error429 = {
          response: { status: 429 },
          isAxiosError: true,
        };
        mockedAxios.get
          .mockRejectedValueOnce(error429)
          .mockResolvedValueOnce({
            data: {
              docs: [{ key: '/authors/OL1A', name: 'Author One' }],
              numFound: 1,
            },
          });

        mockedAxios.get.mockResolvedValue({
          data: { photos: [123] },
        });

        const res = await request(app)
          .get('/api/external-authors/search-author')
          .query({ name: 'Test' })
          .expect(200);

        expect(res.body.authors.length).toBe(1);
      });
    });

    describe('GET /api/external-authors/author/:id', () => {
      it('should return author details by ID', async () => {
        mockedAxios.get.mockImplementation((url: string) => {
        if (url.includes('/authors/OL1A.json')) {
          return Promise.resolve({
            data: {
              key: '/authors/OL1A',
              name: 'Author One',
              photos: [123],
              bio: 'Test bio',
              birth_date: '1900-01-01',
            },
          });
        }
          if (url.includes('/authors/OL1A/works.json')) {
            return Promise.resolve({
              data: {
                entries: [{ title: 'Work One', covers: [456] }],
              },
            });
          }
          if (url.includes('googleapis.com')) {
            return Promise.resolve({
              data: {
                items: [
                  {
                    volumeInfo: {
                      title: 'Work One',
                      imageLinks: { thumbnail: 'thumb_url' },
                      description: 'desc',
                      publisher: 'pub',
                      publishedDate: '2020',
                    },
                  },
                ],
              },
            });
          }
          if (url.includes('wikipedia.org')) {
            return Promise.resolve({
              data: {
                extract: 'Bio from Wikipedia',
                thumbnail: { source: 'photo_url' },
              },
            });
          }
          return Promise.reject(new Error('Not found'));
        });

        const res = await request(app)
          .get('/api/external-authors/author/OL1A')
          .expect(200);

        expect(res.body.author).toHaveProperty('id', 'OL1A');
        expect(res.body.author).toHaveProperty('name', 'Author One');
        expect(res.body.works.length).toBeGreaterThan(0);
      });

      it('should return 404 if author not found by ID', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('Not found'));

        const res = await request(app)
          .get('/api/external-authors/author/OL9999')
          .expect(404);

        expect(res.body).toHaveProperty('error');
      });

      it('should return author details by name fallback', async () => {
        mockedAxios.get.mockImplementation((url: string) => {
          if (url.includes('/search/authors.json')) {
            return Promise.resolve({
              data: {
                docs: [{ key: '/authors/OL1A', name: 'Author One' }],
                numFound: 1,
              },
            });
          }
          if (url.includes('/authors/OL1A.json')) {
            return Promise.resolve({
              data: {
                key: '/authors/OL1A',
                name: 'Author One',
                photos: [123],
              },
            });
          }
          if (url.includes('/authors/OL1A/works.json')) {
            return Promise.resolve({
              data: {
                entries: [{ title: 'Work One', covers: [456] }],
              },
            });
          }
          if (url.includes('googleapis.com')) {
            return Promise.resolve({
              data: {
                items: [
                  {
                    volumeInfo: {
                      title: 'Work One',
                      imageLinks: { thumbnail: 'thumb_url' },
                      description: 'desc',
                      publisher: 'pub',
                      publishedDate: '2020',
                    },
                  },
                ],
              },
            });
          }
          if (url.includes('wikipedia.org')) {
            return Promise.resolve({
              data: {
                extract: 'Bio from Wikipedia',
                thumbnail: { source: 'photo_url' },
              },
            });
          }
          return Promise.reject(new Error('Not found'));
        });

        const res = await request(app)
          .get('/api/external-authors/author/Author%20One')
          .expect(200);

        expect(res.body.author).toHaveProperty('id', 'OL1A');
        expect(res.body.author).toHaveProperty('name', 'Author One');
        expect(res.body.works.length).toBeGreaterThan(0);
      });

      it('should return 404 if author not found by name', async () => {
        mockedAxios.get.mockResolvedValueOnce({
          data: {
            docs: [],
            numFound: 0,
          },
        });

        const res = await request(app)
          .get('/api/external-authors/author/Unknown%20Author')
          .expect(404);

        expect(res.body).toHaveProperty('error');
      });

      it('should handle API failure gracefully', async () => {
        // Clear any cached data first
        const { clearCache } = require('../src/controllers/externalAuthor.controller');
        clearCache();
        // Mock axios to reject for all calls
        mockedAxios.get.mockRejectedValue(new Error('API failure'));

        const res = await request(app)
          .get('/api/external-authors/author/OL1A')
          .expect(404);

        expect(res.body).toHaveProperty('error');
      });
    });

    describe('Utility functions', () => {
      const { retryWithBackoff, getCachedData, setCachedData } = require('../src/controllers/externalAuthor.controller');

      it('retryWithBackoff retries on 429 error and eventually succeeds', async () => {
        let callCount = 0;
        const fn = jest.fn(() => {
          callCount++;
          if (callCount < 3) {
            const error: any = new Error('Rate limit');
            error.response = { status: 429 };
            throw error;
          }
          return Promise.resolve('success');
        });

        const result = await retryWithBackoff(fn, 3, 10);
        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(3);
      });

      it('retryWithBackoff throws error if retries exhausted', async () => {
        const fn = jest.fn(() => {
          const error: any = new Error('Rate limit');
          error.response = { status: 429 };
          throw error;
        });

        await expect(retryWithBackoff(fn, 2, 10)).rejects.toThrow('Rate limit');
        expect(fn).toHaveBeenCalledTimes(3);
      });

      it('getCachedData and setCachedData work with in-memory cache', async () => {
        const key = 'test_key';
        const data = { foo: 'bar' };

        await setCachedData(key, data);
        const cached = await getCachedData(key);
        expect(cached).toEqual(data);
      });
    });
  });
});
