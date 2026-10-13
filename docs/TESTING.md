# Testing Haircut on your phone

The microphone (and the camera on some phones) only works on an HTTPS page, so for phone
testing the dev server on your PC is opened through a free HTTPS tunnel.

## One-time setup

1. Node 22+ and the project installed: `npm install`
2. `.env.local` filled in (copy `.env.example`): your `OPENAI_API_KEY`, a `SHOP_PIN` of 6+
   digits, and the model IDs. Check the key and models with `npm run check:openai`.
3. Create the database and the shop (100 credits): `npm run db:migrate`
4. Install cloudflared (Cloudflare's free tunnel tool), in a terminal:

   ```
   winget install --id Cloudflare.cloudflared
   ```

   Close and reopen the terminal afterwards so `cloudflared` is found.

## Each time you test

Use two terminals in the project folder.

1. Terminal 1, start the app:

   ```
   npm run dev
   ```

2. Terminal 2, start the tunnel:

   ```
   npm run tunnel
   ```

   After a few seconds it prints a box with a URL like
   `https://some-random-words.trycloudflare.com`. That is the address for your phone.

3. On your phone (any network, not just your Wi-Fi), open that URL, enter the shop PIN once,
   and you're in. The login lasts 90 days, but the tunnel URL changes every time you restart
   the tunnel, so you'll log in again on each new URL.

4. When you're done, press `Ctrl+C` in both terminals.

Keep the PC awake while testing: the app runs on it.

## If cloudflared can't connect

Some networks block Cloudflare tunnels (you'll see connection errors repeating). Use ngrok's
free plan instead:

1. Sign up at https://ngrok.com (free) and copy your authtoken from the dashboard.
2. Install and connect it once:

   ```
   winget install --id Ngrok.Ngrok
   ngrok config add-authtoken <your token>
   ```

3. Instead of `npm run tunnel`, run:

   ```
   ngrok http 3000
   ```

   Open the `https://….ngrok-free.app` (or `.ngrok-free.dev`) URL it shows. The first visit
   shows an ngrok warning page: tap "Visit Site".

## On the same Wi-Fi without a tunnel

`npm run dev` also prints a `Network:` address such as `http://192.168.50.159:3000`. That
works for looking at screens, but login and the microphone need HTTPS, so use the tunnel for
real tests.

## What to check

- Log in with the PIN (a wrong PIN shows an error; 5 wrong tries locks for 15 minutes).
- Start → four photos with the camera → voice note → "What we heard" shows what you said.
- Create preview → the steps tick through in about 30 seconds → before/after slider.
- Try again (tries left go 2 → 1 → 0), then Approve this cut → back to Start.
- The credit counter drops by 1 for the customer, not for tries.
- Credits sheet: Buy 100 more adds 100 (mock, no money); Recent previews open read-only.
- Test on both iPhone (Safari) and Android (Chrome).
