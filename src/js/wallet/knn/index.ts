import axios from 'axios';
import { request, gql, GraphQLClient } from 'graphql-request';
import config from '../config';

const knn3ql = config.knn3.openAi;

const getRelatedAddress = async function (address: string, option = 'RSS3_Follow', algo = 'OVERLAP') {
    const related = gql`query {
        ${algo} (address: "${address}",socialConnect:${option}) 
        {
          total,
          data {
            address
          }
        }
      }`;

    const res = await request(knn3ql, related);
    return res[algo];
};

export default { getRelatedAddress };
