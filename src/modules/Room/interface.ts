export interface INft {
    name: string;
    description: string;
    imageUrl: string;
    tokenAddress: string;
    tokenId: string;
}

export interface IProfileData {
    amount: string;
    quantity: string;
    currency: string;
    distributor: string;
    recipient: string;
}
