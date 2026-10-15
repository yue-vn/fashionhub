# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY UltraStrore.csproj ./
RUN dotnet restore UltraStrore.csproj

# Copy source code and build
COPY . ./
RUN dotnet publish UltraStrore.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Ensure uploads directory exists
RUN mkdir -p /app/wwwroot/uploads/chat

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Development
EXPOSE 8080

ENTRYPOINT ["dotnet", "UltraStrore.dll"]
