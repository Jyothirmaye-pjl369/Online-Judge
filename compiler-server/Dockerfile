FROM node:18

# Install compilers
RUN apt update && apt install -y g++ gcc python3

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 6000

CMD ["node", "server.js"]
