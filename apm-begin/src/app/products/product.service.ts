import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { Product } from './product';
import { ProductData } from './product-data';
import { HttpErrorService } from '../utilities/http-error.service';
import { ReviewService } from '../reviews/review.service';
import { Review } from '../reviews/review';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private http = inject(HttpClient); // this does the same thing as using a constructor. 
  // constructor(private http: HttpClient) {}
  private errorService = inject(HttpErrorService);
  private reviewService = inject(ReviewService);


  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl)
      .pipe(
        tap(() => console.log('In Http.get pipeline')),
        catchError(err => this.handleError(err))
      );
  }

  getProduct(id: number) {
    const productUrl = this.productsUrl + '/' + id;
    return this.http.get<Product>(productUrl)
      .pipe(
        tap(() => console.log('In a specific product pipeline')),
        switchMap(product => this.getProductWithReviews(product)),
        catchError(err => this.handleError(err))
      );
  }

  private getProductWithReviews(product: Product): Observable<Product> {
    if (product.hasReviews) {
      return this.http.get<Review[]>(this.reviewService.getReviewUrl(product.id))
        .pipe(
          map(reviews => ({ ...product, reviews} as Product))
        )
    } else {
      return of(product)
    }
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    const formattedMessage = this.errorService.formatError(err);
    return throwError(() => formattedMessage); // throwError is an Angular way of 'throw'(JS) which does the same thing as far as I can tell. Create an obserable to throw an error.
    // throw formattedMessage;
  }
}
