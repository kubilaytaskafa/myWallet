import { apiSlice } from '../api/apiSlice'

export const statsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSummary: builder.query({
      query: () => '/stats/summary',
      providesTags: ['Stats'],
    }),
    getChart: builder.query({
      query: (period = 'monthly') => `/stats/chart?period=${period}`,
      providesTags: ['Stats'],
    }),
    getResidentSummary: builder.query({
      query: () => '/stats/resident-summary',
      providesTags: ['Stats', 'Resident'],
    }),
  }),
})

export const { useGetSummaryQuery, useGetChartQuery, useGetResidentSummaryQuery } = statsApi
