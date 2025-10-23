FROM node:18-alpine

WORKDIR /app

# Копируем package.json первыми для кеширования
COPY package*.json ./
RUN npm install

# Копируем исходный код
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host"]