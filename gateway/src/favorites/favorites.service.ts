import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FavoriteDto } from './dto/favorite.dto';
import { catchError, firstValueFrom } from 'rxjs';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class FavoritesService {
    constructor(
        @Inject('NATS_CLIENT')
        private readonly natsClient: ClientProxy
    ){}

    async addFavorite(dto: FavoriteDto){
        return await firstValueFrom(
            this.natsClient.send('favorites.add', dto).pipe(
                catchError((error) => {
                    throw error;
                }),
            ),
        );
    }

    async removeFavorite(id: string){
        return await firstValueFrom(
            this.natsClient.send('favorites.remove', id).pipe(
                catchError((error) => {
                    throw error;
                }),
            ),
        );
    }

    getAll(userId: string, pagination: PaginationDto) {
        return firstValueFrom(
        this.natsClient.send('favorites.getAll', {
            userId,
            pagination,
        }),
        );
    }

}
