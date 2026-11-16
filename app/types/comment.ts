export type PublicComment = {
  id: string
  body: string
  rating: number | null
  createdAt: string
  author: { name: string; isAdmin: boolean }
}

export type PublicCommentThread = PublicComment & {
  replies: PublicComment[]
}

export type CommentsResponse = {
  status: string
  data: {
    summary: {
      average: number
      count: number
      distribution: Record<1 | 2 | 3 | 4 | 5, number>
    }
    items: PublicCommentThread[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}