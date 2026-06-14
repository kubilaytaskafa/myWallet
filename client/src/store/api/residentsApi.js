import { apiSlice } from '../api/apiSlice'

export const residentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getResidents: builder.query({
      query: () => '/residents',
      providesTags: ['Resident'],
    }),
    createResident: builder.mutation({
      query: (data) => ({
        url: '/residents',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Resident'],
    }),
    updateResident: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/residents/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Resident'],
    }),
    deleteResident: builder.mutation({
      query: (id) => ({
        url: `/residents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Resident'],
    }),
  }),
})

export const {
  useGetResidentsQuery,
  useCreateResidentMutation,
  useUpdateResidentMutation,
  useDeleteResidentMutation,
} = residentsApi
