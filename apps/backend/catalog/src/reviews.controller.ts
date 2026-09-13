import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ReviewsService, ReviewResponse, CreateReviewDto } from './reviews.service'

@Controller('products')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get(':id/reviews')
  getReviews(@Param('id') id: string): Promise<ReviewResponse[]> {
    return this.reviewsService.getProductReviews(id)
  }

  @Post(':id/reviews')
  @UseGuards(AuthGuard('jwt'))
  createReview(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewResponse> {
    return this.reviewsService.create(id, req.user.userId, dto)
  }
}
