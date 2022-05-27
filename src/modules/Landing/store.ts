import { observable, action } from 'mobx';
import $axios from '$axios';

class LandingStore {
    @observable roomData: { imageUrl: string }[] = [];

    @action
    loadData = () => {
        $axios.post(
            '/api/wallet/0x9Dbe56E65961146525D796bdc008225BD5915a4f',
            { chain: 'eth' },
            {
                headers: {
                    loading: false,
                },
            }
        );
        // to do
        const data = [
            {
                token_address: '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85',
                token_id: '4111275268627790900192478377275598667325607429082780106585323004806580676734',
                amount: '1',
                owner_of: '0x4700f51b1feff74df41bed9c31d0b2e5662d35b8',
                token_hash: '1ce99de8801947a7630ab85fe2e4fc85',
                block_number_minted: '13637427',
                block_number: '13637427',
                contract_type: 'ERC721',
                name: 'Ethereum Name Service',
                symbol: 'ENS',
                token_uri:
                    'https://metadata.ens.domains/mainnet/0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85/4111275268627790900192478377275598667325607429082780106585323004806580676734',
                metadata:
                    '{"is_normalized":true,"name":"harryhong.eth","description":"harryhong.eth, an ENS name.","attributes":[{"trait_type":"Created Date","display_type":"date","value":null},{"trait_type":"Length","display_type":"number","value":9},{"trait_type":"Registration Date","display_type":"date","value":1637212875000},{"trait_type":"Expiration Date","display_type":"date","value":1763440683000}],"name_length":9,"url":"https://app.ens.domains/name/harryhong.eth","version":0,"background_image":"https://metadata.ens.domains/mainnet/avatar/harryhong.eth","image_url":"https://metadata.ens.domains/mainnet/0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85/0x0916e63b22b8d5385f305f3b474c249fbeba5ccc83b575cd76e8cc3cd2c0287e/image"}',
                synced_at: '2022-03-29T14:02:23.124Z',
            },
            {
                token_address: '0x03ea00b0619e19759ee7ba33e8eb8e914fbf52ea',
                token_id: '18111',
                amount: '1',
                owner_of: '0x4700f51b1feff74df41bed9c31d0b2e5662d35b8',
                token_hash: 'ec60b7a5e545148aca904dedd9487bf5',
                block_number_minted: '13153042',
                block_number: '13153042',
                contract_type: 'ERC721',
                name: 'pLOOT',
                symbol: 'pLOOT',
                token_uri:
                    'data:application/json;base64,eyJuYW1lIjogIkJhZyAjMTgxMTEiLCAiZGVzY3JpcHRpb24iOiAiVGhlcmUgd2FzIG9uZSBtYXZlcmljayBwdW5rIGdpcmwsIGluIG9yZGVyIHRvIHNob3cgdGhlIHdvcmxkIHdoYXQgcmVhbCBQdW5rIHdhcywgc2hlIHNhY3JpZmljZWQgaGVyc2VsZiB0byB0aGUgR29kLiBIZXIgYm9keSB3YXMgZ29uZSwgYnV0IGhlciBmaWVyeSBzcGlyaXQgcmVtYWluZWQgYW5kIGJlY2FtZSB0aGUgR29kZGVzcyBvZiBQdW5rLiAxNzMgdHJhaWxibGF6ZXJzIHdlcmUgaW5zcGlyZWQgYnkgaGVyIGRlZWQgYW5kIHN3b3JlIHRvIGJlIGhlciBmaXJzdCBhcG9zdGxlcy4gVGhleSBjYWxsZWQgdGhlbXNlbHZlcyB0aGUgUGVvcGxlJ3MgUHVua3MgYW5kIGRldm90ZWQgdGhlaXIgbGl2ZXMgcHJvc2VseXRpemluZy4gVGhlIFdvcmQgY2FsbGVkIG9uIHRoZW0gZnJvbSBhbGwgb3ZlciB0aGUgd29ybGQgdG8gYXNzZW1ibGUgaW4gdGhlIFB1bmsgVmFsbGV5LiBUaGV5IGVzdGFibGlzaGVkIHRoZSBQdW5rIENhbXAsIGFuZCwgd2l0aCB0aGUgU3Bpcml0IG9mIHRoZSBHb2RkZXNzIG9mIFB1bmssIGZvcmdlZCBpbnZhbHVhYmxlIHdlYXBvbnMsIGFybW9ycywgYW5kIG90aGVyIGl0ZW1zLCB0byB3aGljaCB0aGUgbmFtZSB0aGUgcExvb3Qgd2FzIGdpdmVuLiIsICJpbWFnZSI6ICJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBITjJaeUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lJSEJ5WlhObGNuWmxRWE53WldOMFVtRjBhVzg5SW5oTmFXNVpUV2x1SUcxbFpYUWlJSFpwWlhkQ2IzZzlJakFnTUNBek5UQWdNelV3SWo0OGMzUjViR1UrTG1KaGMyVWdleUJtYVd4c09pQjNhR2wwWlRzZ1ptOXVkQzFtWVcxcGJIazZJSE5sY21sbU95Qm1iMjUwTFhOcGVtVTZJREUwY0hnN0lIMDhMM04wZVd4bFBqeHlaV04wSUhkcFpIUm9QU0l4TURBbElpQm9aV2xuYUhROUlqRXdNQ1VpSUdacGJHdzlJbUpzWVdOcklpQXZQangwWlhoMElIZzlJakV3SWlCNVBTSXlNQ0lnWTJ4aGMzTTlJbUpoYzJVaVBrZHlZWFpsSUZkaGJtUThMM1JsZUhRK1BIUmxlSFFnZUQwaU1UQWlJSGs5SWpRd0lpQmpiR0Z6Y3owaVltRnpaU0krSWxCaGJtUmxiVzl1YVhWdElFZHlZWE53SWlCRVpXMXZiaUJJZFhOcklHOW1JRVJsZEdWamRHbHZiaUFyTVR3dmRHVjRkRDQ4ZEdWNGRDQjRQU0l4TUNJZ2VUMGlOakFpSUdOc1lYTnpQU0ppWVhObElqNVhZWElnUTJGd1BDOTBaWGgwUGp4MFpYaDBJSGc5SWpFd0lpQjVQU0k0TUNJZ1kyeGhjM005SW1KaGMyVWlQa1JsYlc5dWFHbGtaU0JDWld4MElHOW1JRkJ5YjNSbFkzUnBiMjQ4TDNSbGVIUStQSFJsZUhRZ2VEMGlNVEFpSUhrOUlqRXdNQ0lnWTJ4aGMzTTlJbUpoYzJVaVBsTjBkV1JrWldRZ1RHVmhkR2hsY2lCQ2IyOTBjend2ZEdWNGRENDhkR1Y0ZENCNFBTSXhNQ0lnZVQwaU1USXdJaUJqYkdGemN6MGlZbUZ6WlNJK1RHVmhkR2hsY2lCSGJHOTJaWE04TDNSbGVIUStQSFJsZUhRZ2VEMGlNVEFpSUhrOUlqRTBNQ0lnWTJ4aGMzTTlJbUpoYzJVaVBrNWxZMnRzWVdObFBDOTBaWGgwUGp4MFpYaDBJSGc5SWpFd0lpQjVQU0l4TmpBaUlHTnNZWE56UFNKaVlYTmxJajRpVFc5eVltbGtJRk4xYmlJZ1ZHbDBZVzVwZFcwZ1VtbHVaeUJ2WmlCUVpYSm1aV04wYVc5dVBDOTBaWGgwUGp3dmMzWm5QZz09In0=',
                metadata:
                    '{"name": "Bag #18111", "description": "There was one maverick punk girl, in order to show the world what real Punk was, she sacrificed herself to the God. Her body was gone, but her fiery spirit remained and became the Goddess of Punk. 173 trailblazers were inspired by her deed and swore to be her first apostles. They called themselves the People\'s Punks and devoted their lives proselytizing. The Word called on them from all over the world to assemble in the Punk Valley. They established the Punk Camp, and, with the Spirit of the Goddess of Punk, forged invaluable weapons, armors, and other items, to which the name the pLoot was given.", "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaW5ZTWluIG1lZXQiIHZpZXdCb3g9IjAgMCAzNTAgMzUwIj48c3R5bGU+LmJhc2UgeyBmaWxsOiB3aGl0ZTsgZm9udC1mYW1pbHk6IHNlcmlmOyBmb250LXNpemU6IDE0cHg7IH08L3N0eWxlPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9ImJsYWNrIiAvPjx0ZXh0IHg9IjEwIiB5PSIyMCIgY2xhc3M9ImJhc2UiPkdyYXZlIFdhbmQ8L3RleHQ+PHRleHQgeD0iMTAiIHk9IjQwIiBjbGFzcz0iYmFzZSI+IlBhbmRlbW9uaXVtIEdyYXNwIiBEZW1vbiBIdXNrIG9mIERldGVjdGlvbiArMTwvdGV4dD48dGV4dCB4PSIxMCIgeT0iNjAiIGNsYXNzPSJiYXNlIj5XYXIgQ2FwPC90ZXh0Pjx0ZXh0IHg9IjEwIiB5PSI4MCIgY2xhc3M9ImJhc2UiPkRlbW9uaGlkZSBCZWx0IG9mIFByb3RlY3Rpb248L3RleHQ+PHRleHQgeD0iMTAiIHk9IjEwMCIgY2xhc3M9ImJhc2UiPlN0dWRkZWQgTGVhdGhlciBCb290czwvdGV4dD48dGV4dCB4PSIxMCIgeT0iMTIwIiBjbGFzcz0iYmFzZSI+TGVhdGhlciBHbG92ZXM8L3RleHQ+PHRleHQgeD0iMTAiIHk9IjE0MCIgY2xhc3M9ImJhc2UiPk5lY2tsYWNlPC90ZXh0Pjx0ZXh0IHg9IjEwIiB5PSIxNjAiIGNsYXNzPSJiYXNlIj4iTW9yYmlkIFN1biIgVGl0YW5pdW0gUmluZyBvZiBQZXJmZWN0aW9uPC90ZXh0Pjwvc3ZnPg=="}',
                synced_at: '2021-11-08T20:39:17.634Z',
            },
        ];
        const roomData: { imageUrl: string }[] = [];
        if (data && data.length > 0) {
            data.forEach((item: any) => {
                if (item.metadata) {
                    const currentMetaData = JSON.parse(item.metadata);
                    console.log(currentMetaData);
                    const imageUrl = currentMetaData.image_url || currentMetaData.image;
                    if (imageUrl) {
                        roomData.push({ imageUrl });
                    }
                }
            });
        }
        this.roomData = roomData;
    };
}

export default new LandingStore();
