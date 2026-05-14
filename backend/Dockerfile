FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY KnowledgeBaseAssistant.Api.csproj ./
RUN dotnet restore KnowledgeBaseAssistant.Api.csproj

COPY . ./
RUN dotnet publish KnowledgeBaseAssistant.Api.csproj \
    --configuration Release \
    --output /app/publish \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish ./

EXPOSE 8080

CMD ["sh", "-c", "dotnet KnowledgeBaseAssistant.Api.dll --urls http://0.0.0.0:${PORT:-8080}"]
