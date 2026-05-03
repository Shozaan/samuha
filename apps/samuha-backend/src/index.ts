import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import routes from './Routes';
import fineService from './Services/Fine/fine.service';

const app = express();
const port = process.env.PORT || 4200;

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

app.use('/api', routes);

app.listen(port, () => {
    console.log(`Samuha Backend running at http://localhost:${port}`);

    // Run daily fine engine at midnight every day
    cron.schedule('0 0 * * *', async () => {
        console.log('[CRON] Running daily fine engine...');
        try {
            await fineService.runFineEngine();
        } catch (err) {
            console.error('[CRON] Fine engine error:', err);
        }
    });

    console.log('[CRON] Fine engine scheduled to run daily at midnight.');
});
