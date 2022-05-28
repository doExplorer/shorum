import { observable, action } from 'mobx';
import $axios from '$axios';
import ipfs from '@/js/ipfs';

class LandingStore {
    @observable roomData: { imageUrl: string }[] = [];

    @action
    loadData = () => {
        $axios
            .post(
                '/api/wallet/0x9Dbe56E65961146525D796bdc008225BD5915a4f',
                { chain: 'eth' },
                {
                    headers: {
                        loading: false,
                    },
                }
            )
            .then((res) => {
                const data = res.data.nfts;
                const roomData: { imageUrl: string }[] = [];
                if (data && data.length > 0) {
                    data.forEach((item: any) => {
                        if (item.metadata) {
                            const currentMetaData = JSON.parse(item.metadata);
                            console.log(currentMetaData);
                            const imageUrl = currentMetaData.image_url || currentMetaData.image;
                            if (imageUrl) {
                                roomData.push({ imageUrl: ipfs.getUrl(imageUrl) });
                            }
                        }
                    });
                }
                this.roomData = roomData.slice(0, 50);
            });
    };
}

export default new LandingStore();
