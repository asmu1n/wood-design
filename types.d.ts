import { InferModel } from 'drizzle-orm';
import users from '@/db/schema/users';
import accounts from '@/db/schema/accounts';
import rooms from '@/db/schema/rooms';
import { registerSchema } from '@/lib/validations';
import { z } from 'zod';

declare global {
    type User = InferModel<typeof users>;
    type Account = InferModel<typeof accounts>;
    type Room = InferModel<typeof rooms>;
    interface IResponse<T = unknown> {
        success: boolean;
        message: string;
        data?: T;
        total?: number;
        pageIndex?: number;
        limit?: number;
    }
    interface QueryParams<P = unknown> extends P {
        pageIndex: number;
        limit: number;
    }
    type AuthCredentials = z.infer<typeof registerSchema>;

    type Point = {
        x: number;
        y: number;
    };

    type DraftPoint = [x: number, y: number, pressure: number];

    type Color = {
        r: number;
        g: number;
        b: number;
    };

    interface Camera extends Point {
        zoom: number;
    }

    type LayerType = 'Rectangle' | 'Ellipse' | 'Path' | 'Text';

    type RectangleLayer = BaseLayer & {
        type: 'Rectangle';
        cornerRadius?: number;
    };

    type EllipseLayer = BaseLayer & {
        type: 'Ellipse';
    };

    type PathLayer = BaseLayer & {
        type: 'Path';
        points: [x: number, y: number, pressure: number][];
    };

    type TextLayer = BaseLayer & {
        type: 'Text';
        text: string;
        fontSize: number;
        fontFamily: string;
        fontWeight: number;
        lineHeight: number;
        textAlign: 'left' | 'center' | 'right' | 'justify';
    };

    type Layer = RectangleLayer | EllipseLayer | PathLayer | TextLayer;

    type CanvasMode = 'None' | 'Inserting' | 'Dragging' | 'Pencil' | 'Resizing';

    type CanvasType =
        | {
              mode: 'None';
          }
        // | {
        //       mode: 'Pencil';
        //   }
        | {
              mode: 'Inserting'; // insert layer or draw  a path
              layerType: LayerType;
          }
        | {
              mode: 'Dragging'; // when cursor  move on layer
              origin: Point | null;
          }
        | {
              mode: 'Resizing'; // when cursor move on layer's border
              initialBounds: XYHW;
              corner: Side;
          }
        | {
              mode: 'Translating';
              currentCursor: Point;
          };

    type Side = 'Top' | 'Bottom' | 'Left' | 'Right' | 'TopLeft' | 'TopRight' | 'BottomLeft' | 'BottomRight';

    interface XYHW extends Point {
        width: number;
        height: number;
    }
}

type BaseLayer = Point & {
    type: LayerType;
    width: number;
    height: number;
    fill: Color;
    stroke: Color;
    opacity: number;
};

export {};
