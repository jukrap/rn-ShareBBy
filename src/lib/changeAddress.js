import React from "react";
import { create } from 'apisauce'

const CLIENT_ID = 'cycfhnicdh';
const CLIENT_SECRET = 'hRfkTI4OMV8l7zFectg5R7VSe43U1qLW6dTmjuOL';

const CHANGE_API = create({
    baseURL: 'https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?',
    headers: {
        'X-NCP-APIGW-API-KEY-ID': CLIENT_ID,
        'X-NCP-APIGW-API-KEY': CLIENT_SECRET,
        'Accept' : 'application/json',
    },
});

export default CHANGE_API