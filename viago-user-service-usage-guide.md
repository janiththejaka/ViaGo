# ViaGO User Service - Usage Guide

## 📋 Overview

**viago-user-service** is a Spring Boot microservice that manages user profiles, driver onboarding, reviews/ratings, and vehicle information in the ViaGO ride-sharing platform. It provides centralized user management capabilities and integrates with other services via RabbitMQ and Eureka service discovery.

---

## 🏗️ Architecture

### Technology Stack
- **Framework**: Spring Boot 3.5.0
- **Language**: Java 21
- **Database**: JPA/Hibernate (database configuration pending)
- **Message Broker**: RabbitMQ
- **Service Discovery**: Netflix Eureka Client
- **HTTP Client**: OpenFeign
- **Port**: `8082`

### Key Components

```
viago-user-service/
├── controller/          # REST API endpoints
├── service/            # Business logic
├── repository/         # Data access layer
├── entity/            # JPA entities
├── dto/               # Data transfer objects
├── exception/         # Exception handling
└── config/            # Configuration classes
```

---

## 🎯 Core Features

### 1. User Profile Management
- Get user profile by ID or email
- Update user profile (name, phone)
- User statistics tracking
- User preferences management

### 2. Driver Management
- Driver onboarding with vehicle registration
- Driver approval workflow
- Vehicle information management
- Driver status tracking (PENDING/APPROVED)

### 3. Reviews & Ratings
- Submit ratings for users/drivers
- Retrieve user reviews
- Automatic average rating calculation
- Total ratings count tracking

### 4. Vehicle Management
- Register driver vehicles
- Retrieve vehicle information
- Plate number uniqueness validation

---

## 🌐 API Endpoints

### User Endpoints (`/users`)

#### Get User Profile
```http
GET /users/{userId}
```
**Response**: Returns user profile with ratings and driver status

**Example Response**:
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": 123,
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "role": "RIDER",
    "driverStatus": null,
    "averageRating": 4.5,
    "totalRatings": 10
  }
}
```

---

#### Get User by Email
```http
GET /users/email/{email}
```
**Response**: Returns user profile by email address

**Example**:
```http
GET /users/email/john@example.com
```

---

#### Update User Profile
```http
PUT /users/{userId}
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+1234567890"
}
```
**Response**: Updated user profile

**Notes**:
- Only provided fields are updated (partial update)
- Both fields are optional

---

#### Get User Reviews
```http
GET /users/{userId}/reviews
```
**Response**: List of all reviews for the user

**Example Response**:
```json
{
  "success": true,
  "message": "Reviews retrieved successfully",
  "data": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Excellent driver!",
      "raterUserId": 456,
      "ratedUserId": 123,
      "createdAt": "2026-02-08T10:00:00"
    },
    {
      "id": 2,
      "rating": 4,
      "comment": "Good service",
      "raterUserId": 789,
      "ratedUserId": 123,
      "createdAt": "2026-02-07T15:30:00"
    }
  ]
}
```

---

#### Get Driver Vehicle
```http
GET /users/{userId}/vehicle
```
**Response**: Vehicle information for the driver

**Example Response**:
```json
{
  "success": true,
  "message": "Vehicle retrieved successfully",
  "data": {
    "id": 1,
    "model": "Toyota Camry",
    "plateNumber": "ABC-1234",
    "color": "Black",
    "userId": 123
  }
}
```

---

### Driver Endpoints (`/drivers`)

#### Onboard Driver
```http
POST /drivers/{userId}/onboard
Content-Type: application/json

{
  "model": "Toyota Camry",
  "plateNumber": "ABC-1234",
  "color": "Black"
}
```

**Features**:
- Converts user to DRIVER role
- Sets driver status to PENDING
- Registers vehicle information
- Validates plate number uniqueness

**Validations**:
- User must exist
- User must not already be a driver
- Plate number must be unique

**Success Response**:
```json
{
  "success": true,
  "message": "Driver onboarding request submitted successfully. Status: PENDING",
  "data": {
    "id": 123,
    "email": "driver@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "role": "DRIVER",
    "driverStatus": "PENDING",
    "averageRating": 0.0,
    "totalRatings": 0
  }
}
```

**Error Responses**:
```json
{
  "success": false,
  "message": "User is already registered as a driver",
  "data": null
}
```
```json
{
  "success": false,
  "message": "Vehicle with plate number ABC-1234 already exists",
  "data": null
}
```

---

#### Approve Driver
```http
PUT /drivers/{userId}/approve
```

**Features**:
- Changes driver status from PENDING to APPROVED
- Validates user is actually a driver
- Prevents duplicate approvals

**Success Response**:
```json
{
  "success": true,
  "message": "Driver approved successfully",
  "data": {
    "id": 123,
    "email": "driver@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "role": "DRIVER",
    "driverStatus": "APPROVED",
    "averageRating": 0.0,
    "totalRatings": 0
  }
}
```

**Error Responses**:
```json
{
  "success": false,
  "message": "User is not registered as a driver",
  "data": null
}
```
```json
{
  "success": false,
  "message": "Driver is already approved",
  "data": null
}
```

---

### Review Endpoints (`/reviews`)

#### Submit Rating
```http
POST /reviews?raterUserId={userId}
Content-Type: application/json

{
  "ratedUserId": 456,
  "rating": 5,
  "comment": "Great driver, very professional!"
}
```

**Features**:
- Rating validation (1-5 scale)
- Self-rating prevention
- Automatic average rating update
- Timestamps review creation

**Validations**:
- Both rater and rated users must exist
- Users cannot rate themselves
- Rating must be between 1-5

**Success Response**:
```json
{
  "success": true,
  "message": "Rating submitted successfully",
  "data": {
    "id": 789,
    "rating": 5,
    "comment": "Great driver, very professional!",
    "raterUserId": 123,
    "ratedUserId": 456,
    "createdAt": "2026-02-08T10:30:00"
  }
}
```

**Error Responses**:
```json
{
  "success": false,
  "message": "User cannot rate themselves",
  "data": null
}
```
```json
{
  "success": false,
  "message": "Rater user not found with id: 123",
  "data": null
}
```

---

## 📊 Data Models

### UserEntity
```java
{
  "id": Long,
  "email": String (unique, max 100 chars),
  "name": String (max 100 chars),
  "phone": String (max 20 chars),
  "role": "RIDER" | "DRIVER",
  "driverStatus": "PENDING" | "APPROVED" (nullable),
  "averageRating": Double (0.0 - 5.0, 2 decimal places),
  "totalRatings": Integer,
  "createdAt": LocalDateTime,
  "updatedAt": LocalDateTime
}
```

### VehicleEntity
```java
{
  "id": Long,
  "model": String,
  "plateNumber": String (unique),
  "color": String,
  "userId": Long (foreign key to UserEntity)
}
```

### ReviewEntity
```java
{
  "id": Long,
  "rating": Integer (1-5),
  "comment": String (optional),
  "raterUserId": Long,
  "ratedUserId": Long,
  "createdAt": LocalDateTime
}
```

### UserPreferenceEntity
```java
{
  "id": Long,
  "userId": Long,
  "emailNotifications": Boolean,
  "smsNotifications": Boolean,
  "pushNotifications": Boolean,
  "theme": String,
  "createdAt": LocalDateTime,
  "updatedAt": LocalDateTime
}
```

### UserStatisticsEntity
```java
{
  "id": Long,
  "userId": Long,
  "totalTrips": Integer,
  "totalDistance": Double,
  "totalSpent": Double,
  "lastTripDate": LocalDateTime,
  "createdAt": LocalDateTime,
  "updatedAt": LocalDateTime
}
```

---

## 🔧 Configuration

### application.yml

```yaml
port: 8082

spring:
  application:
    name: viago-user-service
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest

management:
  endpoints:
    web:
      exposure:
        include: health,info

eureka:
  client:
    service-url:
      DefaultZone: http://localhost:8761/eureka/
```

### Environment Variables

You can override configuration using environment variables:

```bash
# RabbitMQ Configuration
SPRING_RABBITMQ_HOST=rabbitmq-server
SPRING_RABBITMQ_PORT=5672
SPRING_RABBITMQ_USERNAME=admin
SPRING_RABBITMQ_PASSWORD=secret

# Eureka Configuration
EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://eureka-server:8761/eureka/

# Database Configuration (when implemented)
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/viago_users
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=password
```

---

## 🚀 Running the Service

### Prerequisites
1. ✅ Java 21 installed
2. ✅ Maven installed
3. ✅ RabbitMQ running on port 5672
4. ✅ Eureka Server running on port 8761
5. ⏳ Database configured (PostgreSQL/MySQL) - pending

### Start the Service

#### Option 1: Using Maven
```bash
# Navigate to the service directory
cd backend/viago-user-service

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

#### Option 2: Using Java
```bash
# Build the JAR
mvn clean package

# Run the JAR
java -jar target/viago-user-service-1.0-SNAPSHOT.jar
```

#### Option 3: Using IDE
- Open the project in IntelliJ IDEA or Eclipse
- Run the `Main.java` class

**Service will start on**: `http://localhost:8082`

### Health Check
```http
GET http://localhost:8082/actuator/health
```

**Expected Response**:
```json
{
  "status": "UP"
}
```

---

## 🔄 Integration Points

### 1. Service Discovery (Eureka)
- Registers with Eureka Server on startup
- Service name: `viago-user-service`
- Other services discover it via Eureka
- Automatic load balancing

**Example: Other services calling this service**
```java
@FeignClient(name = "viago-user-service")
public interface UserServiceClient {
    @GetMapping("/users/{userId}")
    UserResponse<UserProfileDTO> getUserProfile(@PathVariable Long userId);
}
```

### 2. Message Queue (RabbitMQ)
- Ready for asynchronous event processing
- Can publish/consume user-related events
- Configuration in `RabbitMQConfig.java`

**Potential Events**:
- UserCreatedEvent
- UserUpdatedEvent
- DriverOnboardedEvent
- DriverApprovedEvent
- RatingSubmittedEvent

### 3. OpenFeign Clients
- Enabled via `@EnableFeignClients`
- Can communicate with other microservices
- Built-in retry logic with `spring-retry`

---

## 🛡️ Error Handling

### Exception Types

#### 1. ResourceNotFoundException (404)
**Triggers when**:
- User not found by ID
- User not found by email
- Vehicle not found
- Review not found

**Response**:
```json
{
  "success": false,
  "message": "User not found with id: 123",
  "data": null
}
```

#### 2. BadRequestException (400)
**Triggers when**:
- User already registered as driver
- Duplicate plate number
- Self-rating attempt
- Driver already approved
- Invalid role transition

**Response**:
```json
{
  "success": false,
  "message": "User is already registered as a driver",
  "data": null
}
```

#### 3. Validation Errors (400)
**Triggers when**:
- Missing required fields
- Invalid data format
- Field length violations

**Response**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "rating": "Rating must be between 1 and 5",
    "plateNumber": "Plate number is required"
  }
}
```

### Global Exception Handler

All exceptions are handled by `GlobalExceptionHandler.java`:
- Consistent error response format
- Proper HTTP status codes
- Detailed error messages for debugging
- Production-safe error messages

---

## 📝 Business Logic Highlights

### Driver Onboarding Flow
1. ✅ Check if user exists → `ResourceNotFoundException`
2. ✅ Validate user is not already a driver → `BadRequestException`
3. ✅ Check plate number uniqueness → `BadRequestException`
4. ✅ Update user role to DRIVER
5. ✅ Set driver status to PENDING
6. ✅ Create vehicle record with user association
7. ✅ Log onboarding event
8. ✅ Return updated user profile

**State Transition**:
```
RIDER (no vehicle) → DRIVER + PENDING (with vehicle)
```

### Driver Approval Flow
1. ✅ Check if user exists → `ResourceNotFoundException`
2. ✅ Validate user is a driver → `BadRequestException`
3. ✅ Check driver not already approved → `BadRequestException`
4. ✅ Update driver status to APPROVED
5. ✅ Log approval event
6. ✅ Return updated profile

**State Transition**:
```
DRIVER + PENDING → DRIVER + APPROVED
```

### Rating System
1. ✅ Verify rater user exists → `ResourceNotFoundException`
2. ✅ Verify rated user exists → `ResourceNotFoundException`
3. ✅ Prevent self-rating → `BadRequestException`
4. ✅ Create review record with timestamp
5. ✅ Fetch all reviews for rated user
6. ✅ Calculate new average rating
7. ✅ Round to 2 decimal places (e.g., 4.53)
8. ✅ Update user's total ratings count
9. ✅ Save updated user entity
10. ✅ Return review DTO

**Average Rating Calculation**:
```java
average = sum(all ratings) / total count
rounded = Math.round(average * 100.0) / 100.0
```

### Profile Updates
- ✅ Partial updates supported (only update provided fields)
- ✅ Null checks for each field
- ✅ Transactional to ensure consistency
- ✅ Automatic `updatedAt` timestamp

---

## 🎯 Use Cases & Scenarios

### Scenario 1: New Driver Registration

**Step 1**: User signs up as rider (via viago-auth)
```
User ID: 123
Role: RIDER
```

**Step 2**: User decides to become a driver
```http
POST /drivers/123/onboard
{
  "model": "Honda Accord",
  "plateNumber": "XYZ-9876",
  "color": "White"
}
```

**Result**:
- User role: RIDER → DRIVER
- Driver status: null → PENDING
- Vehicle created and linked
- User can now be reviewed as driver

---

### Scenario 2: Admin Approves Driver

**Current State**:
```
Driver ID: 123
Status: PENDING
```

**Action**:
```http
PUT /drivers/123/approve
```

**Result**:
- Driver status: PENDING → APPROVED
- Driver can now accept rides in viago-rider-engine
- Notification sent (if implemented)

---

### Scenario 3: Rider Rates Driver After Trip

**Context**: Trip completed between Rider 456 and Driver 123

**Action**:
```http
POST /reviews?raterUserId=456
{
  "ratedUserId": 123,
  "rating": 4,
  "comment": "Good service, on time!"
}
```

**Result**:
- Review created with timestamp
- Driver's average rating updated: 0.0 → 4.0
- Total ratings count: 0 → 1

**After multiple ratings**:
- Rating 1: 4 stars
- Rating 2: 5 stars
- Rating 3: 3 stars
- **Average**: (4 + 5 + 3) / 3 = 4.0
- **Total**: 3 ratings

---

### Scenario 4: User Updates Profile

**Action**:
```http
PUT /users/123
{
  "name": "John Michael Doe",
  "phone": "+1-555-0123"
}
```

**Result**:
- Name updated
- Phone updated
- Other fields remain unchanged
- `updatedAt` timestamp refreshed

---

### Scenario 5: Get Driver Information for Trip

**Frontend needs to display driver info during ride**:

```http
GET /users/123
```

**Response includes**:
```json
{
  "id": 123,
  "name": "John Doe",
  "phone": "+1234567890",
  "averageRating": 4.5,
  "totalRatings": 20,
  "role": "DRIVER",
  "driverStatus": "APPROVED"
}
```

**Then get vehicle details**:
```http
GET /users/123/vehicle
```

**Response**:
```json
{
  "model": "Honda Accord",
  "plateNumber": "XYZ-9876",
  "color": "White"
}
```

---

## 🔍 Service Dependencies

| Dependency | Purpose | Required | Status |
|------------|---------|----------|--------|
| **viago-auth** | User authentication | No | Commented out |
| **Eureka Server** | Service discovery | Yes | Configured |
| **RabbitMQ** | Message queue | Yes | Configured |
| **Database** | Data persistence | Yes | Pending configuration |
| **viago-rider-engine** | Trip requests | No | Independent |
| **viago-notification-service** | Notifications | No | Future integration |

---

## 📋 Implementation Status

### ✅ Completed Features
- [x] Entity models with JPA annotations
- [x] Request/Response DTOs with validation
- [x] Service interfaces
- [x] Service implementations with business logic
- [x] REST controllers with proper endpoints
- [x] Exception handling (Global exception handler)
- [x] Driver onboarding workflow
- [x] Driver approval workflow
- [x] Rating and review system
- [x] Vehicle management
- [x] Average rating calculation
- [x] User profile CRUD operations
- [x] Repositories (JPA repositories)
- [x] Lombok integration
- [x] Spring Boot Actuator
- [x] Eureka client configuration
- [x] RabbitMQ configuration
- [x] OpenFeign client setup

### ⏳ Pending Features
- [ ] Database connectivity and schema creation
- [ ] Complete repository implementations with custom queries
- [ ] Authentication/Authorization integration with viago-auth
- [ ] JWT validation
- [ ] Input validation enhancement
- [ ] User statistics service implementation
- [ ] User preferences service implementation
- [ ] Saved addresses functionality
- [ ] Profile picture upload
- [ ] Email/Phone verification
- [ ] Event publishing to RabbitMQ
- [ ] Integration tests
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Docker configuration
- [ ] Monitoring and metrics

---

## 🎨 Best Practices Implemented

### Architecture
- ✅ Layered architecture (Controller → Service → Repository → Entity)
- ✅ Separation of concerns
- ✅ DTOs for request/response separation
- ✅ Interface-based service design

### Code Quality
- ✅ Lombok for boilerplate reduction
- ✅ Builder pattern for object creation
- ✅ Consistent naming conventions
- ✅ Comprehensive logging with SLF4J
- ✅ Transaction management with `@Transactional`

### API Design
- ✅ RESTful API design principles
- ✅ Proper HTTP methods (GET, POST, PUT, DELETE)
- ✅ Meaningful endpoint naming
- ✅ Consistent response structure
- ✅ CORS enabled for frontend integration

### Data Validation
- ✅ Jakarta Validation annotations
- ✅ `@Valid` in controller methods
- ✅ Business logic validation in services
- ✅ Unique constraint enforcement

### Error Handling
- ✅ Custom exception classes
- ✅ Global exception handler
- ✅ Proper HTTP status codes
- ✅ Consistent error response format

---

## 🧪 Testing the API

### Using cURL

#### Get User Profile
```bash
curl -X GET http://localhost:8082/users/1
```

#### Update User Profile
```bash
curl -X PUT http://localhost:8082/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Updated",
    "phone": "+1-555-9999"
  }'
```

#### Onboard Driver
```bash
curl -X POST http://localhost:8082/drivers/1/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Tesla Model 3",
    "plateNumber": "TESLA-123",
    "color": "Red"
  }'
```

#### Approve Driver
```bash
curl -X PUT http://localhost:8082/drivers/1/approve
```

#### Submit Rating
```bash
curl -X POST "http://localhost:8082/reviews?raterUserId=2" \
  -H "Content-Type: application/json" \
  -d '{
    "ratedUserId": 1,
    "rating": 5,
    "comment": "Excellent driver!"
  }'
```

#### Get User Reviews
```bash
curl -X GET http://localhost:8082/users/1/reviews
```

#### Get Driver Vehicle
```bash
curl -X GET http://localhost:8082/users/1/vehicle
```

---

### Using Postman

1. **Import Collection**: Create a new collection named "ViaGO User Service"

2. **Set Base URL Variable**: 
   - Variable: `base_url`
   - Value: `http://localhost:8082`

3. **Create Requests**: Use the endpoints documented above

4. **Example Request Chain**:
   ```
   1. GET {{base_url}}/users/1
   2. POST {{base_url}}/drivers/1/onboard (with body)
   3. PUT {{base_url}}/drivers/1/approve
   4. POST {{base_url}}/reviews?raterUserId=2 (with body)
   5. GET {{base_url}}/users/1/reviews
   ```

---

## 📞 Support & Integration

### For Other Microservices

**Service Discovery via Eureka**:
```java
@FeignClient(name = "viago-user-service")
public interface UserServiceClient {
    
    @GetMapping("/users/{userId}")
    UserResponse<UserProfileDTO> getUserProfile(@PathVariable Long userId);
    
    @GetMapping("/users/{userId}/vehicle")
    UserResponse<VehicleDTO> getDriverVehicle(@PathVariable Long userId);
    
    @GetMapping("/users/{userId}/reviews")
    UserResponse<List<ReviewDTO>> getUserReviews(@PathVariable Long userId);
}
```

**Direct HTTP Call**:
```java
RestTemplate restTemplate = new RestTemplate();
String url = "http://viago-user-service/users/" + userId;
UserResponse response = restTemplate.getForObject(url, UserResponse.class);
```

### Service Information

| Property | Value |
|----------|-------|
| **Service Name** | `viago-user-service` |
| **Port** | `8082` |
| **Base URL (local)** | `http://localhost:8082` |
| **Base URL (Eureka)** | `http://viago-user-service` |
| **Health Endpoint** | `/actuator/health` |
| **Info Endpoint** | `/actuator/info` |
| **Protocol** | HTTP/REST |

---

## 🔐 Security Considerations

### Current State
- ⚠️ **No authentication/authorization currently implemented**
- ⚠️ All endpoints are publicly accessible
- ⚠️ CORS is fully open (`@CrossOrigin` without restrictions)

### Recommended Implementation

#### 1. JWT Validation
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/users/**").authenticated()
                .requestMatchers("/drivers/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/drivers/*/approve").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt());
        return http.build();
    }
}
```

#### 2. Role-Based Access Control
- **RIDER**: Can view own profile, submit reviews
- **DRIVER**: Can view own profile, vehicle, reviews; can onboard
- **ADMIN**: Can approve drivers, view all users

#### 3. CORS Configuration
```yaml
spring:
  web:
    cors:
      allowed-origins: 
        - http://localhost:3000
        - https://viago-frontend.com
      allowed-methods: GET, POST, PUT, DELETE
      allowed-headers: Authorization, Content-Type
```

---

## 🚢 Deployment

### Docker Support (Recommended)

**Create Dockerfile**:
```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/viago-user-service-1.0-SNAPSHOT.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Build and Run**:
```bash
docker build -t viago-user-service:1.0 .
docker run -p 8082:8082 \
  -e SPRING_RABBITMQ_HOST=rabbitmq \
  -e EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://eureka:8761/eureka/ \
  viago-user-service:1.0
```

### Docker Compose (Recommended for Development)

```yaml
version: '3.8'
services:
  viago-user-service:
    build: ./viago-user-service
    ports:
      - "8082:8082"
    environment:
      - SPRING_RABBITMQ_HOST=rabbitmq
      - EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://eureka:8761/eureka/
    depends_on:
      - rabbitmq
      - eureka
      - postgres
```

---

## 📚 Related Documentation

- [ViaGO Auth Service](../backend/viago-auth/README.md)
- [ViaGO Rider Engine](../backend/docs/rider_engine_map.md)
- [ViaGO Notification Service](../backend/viago-notification-service/docs/README.md)
- [ViaGO Admin Services](../backend/viago-admin-services/README.md)

---

## 🤝 Contributing

### Code Style
- Follow Java naming conventions
- Use Lombok annotations appropriately
- Write meaningful commit messages
- Add JavaDoc for public methods
- Keep methods focused and small

### Pull Request Process
1. Create feature branch from `main`
2. Implement feature with tests
3. Update documentation
4. Submit PR with description
5. Address review comments

---

## 📝 Changelog

### Version 1.0-SNAPSHOT (Current)
- ✅ Initial implementation
- ✅ User profile management
- ✅ Driver onboarding and approval
- ✅ Review and rating system
- ✅ Vehicle management
- ✅ Eureka integration
- ✅ RabbitMQ configuration
- ✅ Exception handling

---

## 📧 Contact & Support

For questions or issues:
- Check service health: `http://localhost:8082/actuator/health`
- Review logs for error details
- Check Eureka dashboard: `http://localhost:8761`
- Verify RabbitMQ connection: `http://localhost:15672`

---

**Last Updated**: February 8, 2026  
**Version**: 1.0-SNAPSHOT  
**Service Port**: 8082  
**Framework**: Spring Boot 3.5.0  
**Java Version**: 21
