FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Copy JAR file
COPY target/*.jar app.jar

# Expose API Gateway port
EXPOSE 9090

# Set JVM options for memory management
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:9090/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar app.jar"]