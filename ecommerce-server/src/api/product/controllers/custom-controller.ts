'use strict';

module.exports = {
  async createStudent(ctx) {
    try {
      const {
        name,
        price,
        stock,
        description,
      } = ctx.request.body;

      // Basic validation
      if (!name) {
        return ctx.badRequest('Product name is required');
      }

      if (!description) {
        return ctx.badRequest('Product description is required');
      }

      if (!price) {
        return ctx.badRequest('Price is required');
      }

      if (!stock) {
        return ctx.badRequest('Stock is required');
      }

      // Check duplicate student number
      const existingProduct = await strapi
        .documents('api::product.product')
        .findMany({
          filters: {
            name: {
              $eq: name,
            },
          },
        });

      if (existingProduct.length > 0) {
        return ctx.badRequest('Student number already exists');
      }

      // Create student
      const student = await strapi
        .documents('api::product.product')
        .create({
          data: {
            name,
            price,
            stock,
            description,
          },
        });

      ctx.body = {
        success: true,
        message: 'Student created successfully',
        data: student,
      };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  
};