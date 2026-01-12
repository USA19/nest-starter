import { HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';
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
  async updateEntityManager<T extends ObjectLiteral>(entity: DynamicClassEntity<T>, id: string, attributes: QueryDeepPartialEntity<T>, repository: Repository<T>): Promise<T> {
    try {
      const update = await repository
        .createQueryBuilder()
        .update(entity)
        .set({ ...attributes })
        .where("id = :id", { id })
        .execute();

      if (!update) {
        throw new NotFoundException({
          status: HttpStatus.NOT_FOUND,
          error: `${entity.name} Not found`,
        })
      }

      const { affected = 0 } = update;

      if (affected === 0) {
        throw new NotFoundException({
          status: HttpStatus.NOT_FOUND,
          error: `${entity.name} Not found`,
        })
      }

      const updated = await repository.createQueryBuilder()
        .where("id = :id", { id })
        .getOne()

      return updated as T;

    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
