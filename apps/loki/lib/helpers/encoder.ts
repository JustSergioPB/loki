export function baseEncode(
  bytes: Uint8Array,
  targetBase: number,
  baseAlphabet: string
): string {
  let zeroes = 0;
  let length = 0;
  let begin = 0;
  const end = bytes.length;

  // count the number of leading bytes that are zero
  while (begin !== end && bytes[begin] === 0) {
    begin++;
    zeroes++;
  }

  // allocate enough space to store the target base value
  const baseExpansionFactor = Math.log(256) / Math.log(targetBase);
  const size = Math.floor((end - begin) * baseExpansionFactor + 1);
  const baseValue = new Uint8Array(size);

  // process the entire input byte array
  while (begin !== end) {
    let carry = bytes[begin];

    // for each byte in the array, perform base-expansion
    let i = 0;
    for (
      let basePosition = size - 1;
      (carry !== 0 || i < length) && basePosition !== -1;
      basePosition--, i++
    ) {
      carry += 256 * baseValue[basePosition];
      baseValue[basePosition] = Math.floor(carry % targetBase);
      carry = Math.floor(carry / targetBase);
    }
    length = i;
    begin++;
  }

  // skip leading zeroes in base-encoded result
  let baseEncodingPosition = size - length;
  while (
    baseEncodingPosition !== size &&
    baseValue[baseEncodingPosition] === 0
  ) {
    baseEncodingPosition++;
  }

  // convert the base value to the base encoding
  let baseEncoding = baseAlphabet.charAt(0).repeat(zeroes);

  for (; baseEncodingPosition < size; ++baseEncodingPosition) {
    baseEncoding += baseAlphabet.charAt(baseValue[baseEncodingPosition]);
  }

  return baseEncoding;
}

export function baseDecode(
  sourceEncoding: string,
  sourceBase: number,
  baseAlphabet: string
): Uint8Array {
  // build the base-alphabet to integer value map
  const baseMap: { [key: string]: number } = {};
  for (let i = 0; i < baseAlphabet.length; i++) {
    baseMap[baseAlphabet[i]] = i;
  }

  // skip and count zero-byte values in the sourceEncoding
  let sourceOffset = 0;
  let zeroes = 0;
  let decodedLength = 0;

  while (sourceEncoding[sourceOffset] === baseAlphabet[0]) {
    zeroes++;
    sourceOffset++;
  }

  // allocate the decoded byte array
  const baseContractionFactor = Math.log(sourceBase) / Math.log(256);
  const decodedSize = Math.floor(
    (sourceEncoding.length - sourceOffset) * baseContractionFactor + 1
  );
  const decodedBytes = new Uint8Array(decodedSize);

  // perform base-conversion on the source encoding
  while (sourceEncoding[sourceOffset]) {
    // process each base-encoded number
    let carry = baseMap[sourceEncoding[sourceOffset]];

    // convert the base-encoded number by performing base-expansion
    let i = 0;
    for (
      let byteOffset = decodedSize - 1;
      (carry !== 0 || i < decodedLength) && byteOffset !== -1;
      byteOffset--, i++
    ) {
      carry += sourceBase * decodedBytes[byteOffset];
      decodedBytes[byteOffset] = Math.floor(carry % 256);
      carry = Math.floor(carry / 256);
    }
    decodedLength = i;
    sourceOffset++;
  }

  // skip leading zeros in the decoded byte array
  let decodedOffset = decodedSize - decodedLength;
  while (decodedOffset !== decodedSize && decodedBytes[decodedOffset] === 0) {
    decodedOffset++;
  }

  // create the final byte array that has been base-decoded
  const finalBytes = new Uint8Array(zeroes + (decodedSize - decodedOffset));
  let j = zeroes;
  while (decodedOffset !== decodedSize) {
    finalBytes[j++] = decodedBytes[decodedOffset++];
  }

  return finalBytes;
}
