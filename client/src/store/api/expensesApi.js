import { apiSlice } from '../api/apiSlice'

export const expensesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query({
      query: (params = {}) => {
        const { start, end, resident_id } = params
        const queryParams = new URLSearchParams()
        if (start) queryParams.append('start', start)
        if (end) queryParams.append('end', end)
        if (resident_id) queryParams.append('resident_id', resident_id)
        const queryString = queryParams.toString()
        return `/expenses${queryString ? `?${queryString}` : ''}`
      },
      providesTags: ['Expense'],
    }),
    getExpenseById: builder.query({
      query: (id) => `/expenses/${id}`,
      providesTags: (result, error, id) => [{ type: 'Expense', id }],
    }),
    createExpense: builder.mutation({
      query: (data) => ({
        url: '/expenses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Expense', 'Stats'],
    }),
    updateExpense: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/expenses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Expense', 'Stats'],
    }),
    deleteExpense: builder.mutation({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Expense', 'Stats'],
    }),
  }),
})

export const {
  useGetExpensesQuery,
  useGetExpenseByIdQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = expensesApi
