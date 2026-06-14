import { apiSlice } from '../api/apiSlice'

export const incomesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getIncomes: builder.query({
      query: (params = {}) => {
        const { start, end, resident_id } = params
        const queryParams = new URLSearchParams()
        if (start) queryParams.append('start', start)
        if (end) queryParams.append('end', end)
        if (resident_id) queryParams.append('resident_id', resident_id)
        const queryString = queryParams.toString()
        return `/incomes${queryString ? `?${queryString}` : ''}`
      },
      providesTags: ['Income'],
    }),
    getIncomeById: builder.query({
      query: (id) => `/incomes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Income', id }],
    }),
    createIncome: builder.mutation({
      query: (data) => ({
        url: '/incomes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Income', 'Stats'],
    }),
    updateIncome: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/incomes/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Income', 'Stats'],
    }),
    deleteIncome: builder.mutation({
      query: (id) => ({
        url: `/incomes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Income', 'Stats'],
    }),
  }),
})

export const {
  useGetIncomesQuery,
  useGetIncomeByIdQuery,
  useCreateIncomeMutation,
  useUpdateIncomeMutation,
  useDeleteIncomeMutation,
} = incomesApi
