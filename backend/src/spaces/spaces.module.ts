import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Space, SpaceSchema } from '../schemas/space.schema';
import { Reservation, ReservationSchema } from '../schemas/reservation.schema';
import { SpacesService } from './spaces.service';
import { SpacesController } from './spaces.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Space.name, schema: SpaceSchema },
      { name: Reservation.name, schema: ReservationSchema }
    ]),
    UsersModule,
  ],
  controllers: [SpacesController],
  providers: [SpacesService],
  exports: [SpacesService],
})
export class SpacesModule {}