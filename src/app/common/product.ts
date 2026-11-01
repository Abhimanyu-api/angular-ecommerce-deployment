export class Product {

    constructor(public id: number,
                public sku: string,
                public name: string,
                public description: string,
                public unitPrice: number,
                public imageUrl: string,
                public active: boolean,
                public unitsInStock: number,
                public dateCreated: Date,
                public lastUpdated: Date
    ) {
    }
}


// export class Product {
//     id!: number;
//     sku!: string;
//     name!: string;
//     description!: string;
//     unitPrice!: number;
//     imageUrl!: string;
//     active!: boolean;
//     unitsInStock!: number;
//     dateCreated!: string;
//     lastUpdated!: string | null;
// }
