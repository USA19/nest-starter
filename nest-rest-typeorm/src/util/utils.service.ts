import { HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { DynamicClassEntity } from './dto/dynamic-entity';

@Injectable()
export class UtilsService {
  /**
    * Updates entity manager
    * @template T 
    * @param entity 
    * @param id 
    * @param attributes 
    * @param repository 
    * @returns entity manager 
    */
  async updateEntityManager<T>(entity: DynamicClassEntity<T>, id: string, attributes: QueryDeepPartialEntity<T>, repository: Repository<T>): Promise<T> {
    try {
      const update = await repository
        .createQueryBuilder()
        .update(entity)
        .set({ ...attributes })
        .where("id = :id", { id })
        .execute();

      if (update.affected > 0) {
        return await repository.createQueryBuilder()
          .where("id = :id", { id })
          .getOne()
      }

      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: `${entity.name} Not found`,
      })
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
