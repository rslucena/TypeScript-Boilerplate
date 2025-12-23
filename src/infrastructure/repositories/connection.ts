const connection = {
	port: Number(process.env.POSTGRES_PORT),
	host: String(process.env.POSTGRES_SERVER),
	password: String(process.env.POSTGRES_PASSWORD),
	username: String(process.env.POSTGRES_USER),
	database: String(process.env.POSTGRES_DATABASE),
};

export default connection;
