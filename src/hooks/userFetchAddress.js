const userFetchAddress = async (latitude, longitude) => {
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCKEnmMSbRzEbeqOwoO_zKm7qLhNhhhDKs&language=ko`)
    const json = await res.json();
    if (json.results && json.results.length > 0) {
        const pickLocation = json.results[0].formatted_address;
        return pickLocation
    } else {
        console.error('no results');
    }
}
export default userFetchAddress;
