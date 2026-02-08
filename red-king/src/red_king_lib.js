export const delay = async (time) => {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, time);
  });
};

const encode = (text) => new TextEncoder().encode(text);

export const decode = (arrBuffer) => new TextDecoder().decode(arrBuffer);

export const takeInput = async (conn, message) => {
  const buff = new Uint8Array(10);
  writeOnConnection(conn, message);
  const count = await conn.read(buff);
  const rawData = buff.slice(0, count);

  const data = decode(rawData).trim();
  return data;
};

export const writeOnConnection = async (conn, content) => {
  await conn.write(encode(content));
};

export const broadcast = (players, message) => {
  players.forEach(async ({ conn }) => {
    await writeOnConnection(
      conn,
      message,
    );
  });
};
