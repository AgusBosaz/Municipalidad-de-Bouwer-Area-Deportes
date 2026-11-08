# Etapa 1: compilar y publicar la aplicación.
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

COPY . .

RUN dotnet restore Muni-Bouwer.Api/Muni-Bouwer.Api.csproj

RUN dotnet publish Muni-Bouwer.Api/Muni-Bouwer.Api.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish

# Etapa 2: ejecutar la aplicación publicada.
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_HTTP_PORTS=8080

EXPOSE 8080

ENTRYPOINT ["dotnet", "Muni-Bouwer.Api.dll"]