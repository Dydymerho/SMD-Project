package com.smd.api_gateway; //khai báo package

import org.springframework.boot.SpringApplication; //class cốt lõi của spring boot
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication // chỉ định đây là một ứng dụng Spring Boot
public class ApiGatewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiGatewayApplication.class, args);
	}

}
