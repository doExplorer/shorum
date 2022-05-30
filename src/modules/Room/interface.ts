export interface INft {
    name: string;
    description: string;
    imageUrl: string;
    tokenAddress: string;
    tokenId: string;
}

export interface IProfileData {
    profileId: string;
    amount: string;
    quantity: string;
    currency: string;
    distributor: string;
    recipient: string;
}
