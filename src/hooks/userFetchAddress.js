import { useState } from 'react';

const userFetchAddress = async (latitude, longitude) => {
    // console.log('-------값 받아오기 전----------');
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCKEnmMSbRzEbeqOwoO_zKm7qLhNhhhDKs&language=ko`)
    const json = await res.json();
    // console.log('res', res);
    // console.log('json', json);
    if (json.results && json.results.length > 0) {
        const pickLocation = json.results[0].formatted_address;
        // const { lat, lng } = json.results[0].geometry.location;

        return pickLocation
    } else {
        console.error('no results');
    }
}
export default userFetchAddress;
