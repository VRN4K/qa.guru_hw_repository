
export function getRandomNumber(array) {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
}

export function getRandomNumberNotContainedInArray(arrayLength) {
    return Math.floor((Math.random() + arrayLength) * arrayLength);
}