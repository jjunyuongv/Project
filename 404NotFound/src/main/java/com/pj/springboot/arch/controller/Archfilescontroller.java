package com.pj.springboot.arch.controller;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.pj.springboot.arch.dto.ArchfilesDTO;
import com.pj.springboot.arch.service.ArchfilesService;
import com.pj.springboot.arch.util.FileUtil;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/archivefiles")

public class Archfilescontroller {
	   @Autowired
	   ArchfilesService filesService;

	   @GetMapping("/{archId}")
	   public ResponseEntity<List<ArchfilesDTO>> fileList(@PathVariable("archId") int archId) {
	      return ResponseEntity.ok(filesService.getFileListWithArchId(archId));
	   }

	   // 실제 파일 업로드 관련
	   @PostMapping()
	   public int filesWrite(@RequestParam(name = "fileList") List<MultipartFile> fileList, @RequestParam(name = "sfileList") List<String> sfileList) {
	      // 뭔가 오류가나서 저장할 이름과 실제 파일들의 개수가 맞지 않을 경우
	      if (fileList.size() != sfileList.size()) {
	         return -1;
	      }

	      try {
	         FileUtil.uploadFiles(fileList, sfileList);
	      } catch (Exception e) {
	         return -1;
	      }
	      return 1;

	   }

	   @DeleteMapping()
	   public int filesDelete(@RequestParam List<MultipartFile> fileList, @RequestParam List<String> sfileList) {
	      try {
	         FileUtil.deleteFiles(sfileList);
	      } catch (FileNotFoundException e) {
	         return -1;
	      }

	      return 1;
	   }

	   @GetMapping("/download/{archId}")
	   public void fileDownload(@PathVariable("archId") int archId, HttpServletResponse resp) {
		  List<ArchfilesDTO> list = filesService.getFileListWithArchId(archId);
	      try {
	    	 for (ArchfilesDTO fileDto : list) {
	    		 FileUtil.downloadFile(fileDto.getSfile(), fileDto.getOfile(), resp); 		 
	    	 }
	      } catch (IOException e) {
	         // TODO Auto-generated catch block
	         e.printStackTrace();
	      }
	   }	
}
