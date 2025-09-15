//package com.pj.springboot.facilities.service;
//
//import java.util.ArrayList;
//import java.util.List;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.domain.Pageable;
//import org.springframework.stereotype.Service;
//
//import com.pj.springboot.dto.EmployeeDTO;
//import com.pj.springboot.entity.EmployeeEntity;
//import com.pj.springboot.facilities.entity.Employees;
//import com.pj.springboot.repository.EmployeeRepository;
//
//import jakarta.transaction.Transactional;
//
//@Service
//@Transactional
//public class EmployeesService {
//	@Autowired
//	EmployeeRepository employeeRepository;
//
//	// entity로 가져와 dto로 변환
//	public List<EmployeeDTO> getList(String type) {
//		List<EmployeeEntity> entityList = employeeRepository.findAll();
//		List<EmployeeDTO> list = new ArrayList<>();
//		for (Employees entity : entityList) {
//			list.add(new EmployeeDTO(entity, type));
//		}
//		return list;
//	}
//
//	public List<EmployeeDTO> getListSearch(String searchField, String searchWord, String type) {
//		List<Employees> entityList = null;
//		switch (searchField) {
//		case "employeeName":
//			entityList = employeesRepository.findByEmployeeNameLike("%" + searchWord + "%");
//			break;
//		}
//		List<EmployeeDTO> list = new ArrayList<>();
//		for (Employees entity : entityList) {
//			list.add(new EmployeeDTO(entity, type));
//		}
//
//		return list;
//	}
//
//	public Long count() {
//		return employeesRepository.count();
//	}
//
//	public Long count(String searchField, String searchWord) {
//		switch (searchField) {
//		case "employeeName":
//			return employeesRepository.countByEmployeeNameLike("%" + searchWord + "%");
//		}
//
//		return (long) 0;
//	}
//
//	public List<EmployeeDTO> getListWithPaging(int page, int size, String type) {
//		Pageable pageable = PageRequest.of(page - 1, size);
//		Page<Employees> entityList = employeesRepository.findAll(pageable);
//		List<EmployeeDTO> list = new ArrayList<>();
//		for (Employees entity : entityList) {
//			list.add(new EmployeeDTO(entity, type));
//		}
//
//		return list;
//	}
//
//	public List<EmployeeDTO> getListSearchWithPaging(String searchField, String searchWord, int page,
//			int size, String type) {
//		Pageable pageable = PageRequest.of(page - 1, size);
//		Page<Employees> entityList = Page.empty();
//
//		switch (searchField) {
//		case "employeeName":
//			entityList = employeesRepository.findByEmployeeNameLike("%" + searchWord + "%", pageable);
//			break;
//		}
//
//		List<EmployeeDTO> list = new ArrayList<>();
//		for (Employees entity : entityList) {
//			list.add(new EmployeeDTO(entity, type));
//		}
//
//		return list;
//	}
//}
