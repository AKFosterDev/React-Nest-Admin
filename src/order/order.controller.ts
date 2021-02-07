import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Res,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { OrderService } from './order.service';
import { Response } from 'express';
import { Parser } from 'json2csv';
import { OrderItem } from './order-item.entity';
import { Order } from './order.entity';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard)
@Controller()
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get('orders')
  async all(@Query('page') page = 1) {
    return this.orderService.paginate(page, ['order_items']);
  }

  @Post('export')
  async export(@Res() res: Response) {
    const parser = new Parser({
      fields: ['ID', 'Name', 'Email', 'Product Title', 'Price', 'Quantity'],
    });

    const orders = await this.orderService.all(['order_items']);

    const json = [];

    orders.forEach((order: Order) => {
      json.push({
        ID: order.id,
        Name: order.name,
        Email: order.email,
        'Product Title': '',
        Price: '',
        Quantity: '',
      });

      order.order_items.forEach((item: OrderItem) => {
        json.push({
          ID: '',
          Name: '',
          Email: '',
          'Product Title': item.product_title,
          Price: item.price,
          Quantity: item.quantity,
        });
      });
    });

    const csv = parser.parse(json);

    res.header('Content-Type', 'text/csv');
    res.attachment('orders.csv');
    return res.send(csv);
  }
}
