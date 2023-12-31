import express from "express"; // using express
import http from "http";
import { createAdapter } from "socket.io-redis";
import { Socket } from "socket.io";
import { Server } from "socket.io";
import Configs from "../configs";
import { OnConnect } from "./events/on-connect";
import { Logger } from "../sequelize/utils/logger";
import { RedisClient } from "redis";
import chalk from "chalk";
import { User } from "../sequelize";
import { TokenCore } from "../sequelize/middlewares/auth/token";

const socketConfig = Configs!.WSServerConfigurations;
const redisConfig = Configs!.RedisServerConfiguration;

declare module "socket.io" {
	interface Socket {
		t(message: string, ...args: any): string;
		locale: string;
		userId?: string;
		meetingId?: string;
		user?: User;
	}
}

export const StartSocketServer = () => {
	try {
		let app = express();
		let server = http.createServer(app);
		Logger.infoBright("* Attempting to start Socket Server");
		let io = new Server(server, {
			pingInterval: 4000,
			pingTimeout: 5000,
		});
		const pubClient = new RedisClient(redisConfig);
		const subClient = pubClient.duplicate();
		io.adapter(createAdapter({ pubClient, subClient }));

		// make connection with user from server side
		io.on("connection", (socket: Socket) => OnConnect(io, socket));

		const port = socketConfig.port; // setting the port
		const onLaunchServer = () => {
			console.timeEnd("* Server start process took");
			Logger.info(
				`* Socket Server is Live at: ${chalk.bold.greenBright(
					socketConfig.host + ":" + port
				)} \\o/`
			);
		};

		server.listen(port, onLaunchServer);
	} catch (error) {
		Logger.error(error);
	}
};

let tok1 = decodeURIComponent(
	"U2FsdGVkX1%2Bfqilq97VQBzCKu4uAM57H93ZPjKPWf0Pe0Qz3OE9nX7IT3%2BQXCxya2xM3F1VsfO9iNFn6SwBlqU2ngd4hBNWq7rcBKe98vkGZF2mILNmgBK2SUy%2BhcQonMPp3%2FX5q87W9LKacxvqbQ4RI9CTty%2Fwn69AiQ4G9jYmGS2IDiYPhPJCZ6hetGcNfwurQ3pk%2FjnPWMS9sxSmeM2X9RtkUXgTqsLu281N41u7f7Ho%2BSX1RaIGS%2BzS9klkV3bGtlJazroZdpFjsfNvJnCT%2F18qR%2FkY19Mbvrhsp%2BU9pYO57vK0SkjdDnTQFpBHKKw%2FdtoL0lRFiKgLZVYgda%2FttFmRy7fN0C%2B8ultFEreGZFvCNiGGw%2FeXDym1sGECAHgjMM3FBuvnmYEGCXHctCuzVtgs%2B%2Fu9p3V8h6D9IbqWf%2B7lfb91swjhbwOMX0VuDJ%2FgNmUvmbEJ75vUsUYnm2kguony8wg5MjFcKB%2BekP%2BTLUeo4p6iEyp5ba%2FF%2BFpXhDyFsByhZ9eUjxTVD3yuVEzDZLOr0lEvXp9RvlWUn4Dl6XA3r8%2BI6HWU4ADZtO0n8%2FVStpxsHU8GIKlZc4qfkearkexyO%2BoIM5Q8NHCP3zettas6JqjdWAeCDP5q%2Fuy%2F4beFxVSCxYs8%2FFtPNtTcSjLImGbj1%2BSNMF7uCcPjY2POtLClRk3bllsStGKTB2K6YQojYn37UIRzOZ45c7DAEu5Tv5jg7AO4Ka6kXmLAIvi3nzUDWdS0%2Fx5R%2FDOU%2BG3bz13%2BAJRMn5g7R1XF51MPhYZDr46%2F%2BFCmc7AkxnXyKr3snHwx0ek52%2FhuHRozn3EvN3qpivvtGA94yskpO8hjujBbniBuNrdC7dP9bhaH5%2BZMlSy9RAMOEpBGd1247kAteiAxoRX%2FWrICT9DlLrSZ%2BfQzLWzh2GBGXcdN8wuS2J%2FPK%2FzYQIA%2B%2FL2ErJ57FDzmy9HEY2uj%2Fv5XPdl4CSNP4TGKev5iCjo7nsWSeeh7n7LPfaiZPDCjdggG8nkFzSnjhwnOeQbwaCml8zNLB3cTZjqZHgM3BmPZSHQ%2BBpxJKlI4WYJnxpag9kjFNwO3PERWgZ%2FntPCbfNXgsiYxY9NXKTCOr0F%2FTqu%2FYQW3UKTWbEPvK0%2Fg5pm%2F29bn3%2FHmZK%2FIAsFTE5Sfj%2F63Ief280no9j5lAMHw5vsBl0BoHouIeQrU59fmK8%2FFSfdJWeGS09onuZZLxR0A9TfOWeaYzoLwB0Mwq9sNaSRzjYNchXLhoivILf%2BmatrJARP2cWz8OLQxZWyb4nR2lFph2%2FGt4%2BAFhwkUe7DnON9V%2BWmVvyx1Psbc%3D"
);
let tok2 = decodeURIComponent(
	"U2FsdGVkX194ST%2FL8k9B7TMIz0XdWuujAKctCWl5Ex7crsUBdTfe5zsWyFDXFymfxHHTLuDJQbhEWNjRRgVp6gUOmoJKCRXmKTKv7LaV5dC7On9aESI9KfqnNQhwGQpTXwOyqstkRCHkcahN%2F8szJYYvXdOpKJcAiVI%2BzIOA84SNB63rPGBFbnfcuRHSNRZDqsyGQZHHhRTvoX2lk0wSzfWfUW4nqsnyxMfEGj9xTaIqYAHyohJC7wj2S5SZ5Wg0QRgZlEagRDCDuj6v7s2GqkFeeAc4B2VNak92yZaW3%2F5%2Bp1c%2FZK6YKGI%2Ff1pYKImUrh1AOBQ%2FHH41l%2FYeDMGQqW1sD28%2B%2FNLqDS1gbVnwZcLfSVBpUQFa%2FbnA0oWgKe3pkZt4frvEx0rnSctL7EToNpDPDGdFdiYYGjf7RlzgmJJQIWR56fEpi9LQrlwGoVNiwXucYl3HAbT%2B4nErfl8%2F%2FkAReyKjyaDKtec%2FWxnkuRSPq%2BmFAbAfvTGHjQtP%2BpCeKDBysVrVGVwQ1OPhC0ujyIc4BnwsAuqRhOSl4hE1G1je7gb%2B2ZpjL7Re056kwkjGqh1gpk8MTpJ7nHwfNyo7pxHP8DPjzek7aZDGxijyxev4rT5nxBJOCECZ4YrjUaONkNdO83WHMqFOUJZ1YyOvTTYlkSCb5dMfIO2MpJqPV8R2D3hj92YuvZNnl5zoJeKOjvKe4EOGRVVT6FqfKnqjkCG8NHeHsghiVs56G%2F5MT7SOraLpVTTGUYKTTp3Qq7Q8tsrNAPPPISI7j2CwrjVtWNjSC8abCNYeDsP9mCD7DvedbqRRHisPH7B5NDI0p8Ky%2Fcf5lX6tsr%2FMXg4tv5hnxz5tdUFKA8xTHfLvclRY7TFIslvF2%2B0JlYgTDFVw4YUGILeSvjiKJP0iKBpdc8ujkZ8uzV5hodTLbK6HdtCj2sh0UzW0s5f9NYXvCV%2BX96vIZq%2F10BwGcerPyx2XVuYJqoYOsnuBQGaulgGTfpxTF%2BCo6bM5G9doU8fVCHQhUUlPu%2Fr8ogRVck4sU6DPpZw58YWc3AmEwqbZvSeyY%2Bcwda7DpGi1iCsUG1fM02wXJDYjzBEiengNzBC1ZsvbfFUE%2BbOFcactV0JE6tEcix1nkUp7I0Zh2nG%2FZPp8FvvrxHxHMTlY%2B2lC9loJ%2BPmoOOaQH5xMRy9v98ltO5cO%2BKMBHbTYbL%2BcH8gOfGVNNYJtUqcDAPYQ6wvd6t2lcLOpeeSew7bg29lhwponCa6ILu5QDN28MfPXhbTPhoZIh6vcZ86RCtO22wAUluy6clI5BN83Jy8UOcbWfOv1wS%2FzRJ4ngiuPJkER1hSybAQo%2BaSXuSQD61YdbXBPAK%2F7y8AjigfN18lH2pugXzVHjVS4AApUDZb%2FqU%2Bh8iYbRm7SqHwrTpRQDk42Lfuon1g7osAno9elNc882Lmj%2FcPzFSWF%2Fjl15ApGnsWcRSF52CZiFsIEYmTIqGIBuYBSGB8kj0ZXZ%2BYh45DHXe2dze%2BmhyycMIoumZKijJLYGdUFxetKlVmA4gccNf0MDhQQcjxowAtQeW1LcWS7K3PxxlqUB4CJxfstE0%2BSR6xDlEpEsiC8mjbr7VTABLuahn%2BzpI2h4C%2FqQGizZV6gGWzemf4LwIWZOW2BN9G3AiqJKMj6BXGHoSwUDO6CufUwiB23Q6JsmByD7j1KgHWG6y5X6Hs77YlWrxjQtQe21fbx6Z5QnOdbiZh0D0O9%2BN3q8PzIYiOWCG8o%2F%2By2tW7HwmBgsDdMoQ7ejq4s%2BoQ%3D"
);

let tok1Jwt = TokenCore.DecryptAES(tok1);
let tok2Jwt = TokenCore.DecryptAES(tok2);

console.log(tok1Jwt);
console.log(tok2Jwt);
