package com.pj.springboot.arch.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

import org.springframework.util.ResourceUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletResponse;

public class FileUtil {
	public static void uploadFiles(List<MultipartFile> fileList, List<String> sfileList)
	         throws IOException, ServletException {
//	      String uploadDir = ResourceUtils.getFile("classpath:static/uploads/").toPath().toString();
//	      System.out.println(uploadDir);

	      for (int i = 0; i < fileList.size(); i++) {
	         MultipartFile file = fileList.get(i);
	         String fileName = sfileList.get(i);
	         file.transferTo(new File("/app/uploads/" + fileName.substring(0, fileName.lastIndexOf("."))));
	      }
	   }

	   public static void deleteFiles(List<String> sfileList) throws FileNotFoundException {
//	      String uploadDir = ResourceUtils.getFile("/app/uploads").toPath().toString();
	      for (int i = 0; i < sfileList.size(); i++) {
	         File deleteFile = new File("/app/uploads/" + sfileList.get(i));
	         if (deleteFile.exists()) {
	            deleteFile.delete();
	         }
	      }
	   }

	   public static void downloadFile(String sfile, String ofile, HttpServletResponse resp) throws IOException {
	      try {
	         String uploadDir = "/app/uploads/";
	         String path = uploadDir + "/" + sfile;
	         File file = new File(path);
	         FileInputStream in = new FileInputStream(path);
	         String fileNameCon = new String(ofile.getBytes("UTF-8"), "8859_1");

	         resp.setContentType("application/octet-stream");
	         resp.setHeader("Content-Disposition", "attachment; filename=" + fileNameCon);
	         OutputStream os = resp.getOutputStream();

	         int length;
	         byte[] b = new byte[(int) file.length()];
	         while ((length = in.read(b)) > 0) {
	            os.write(b, 0, length);
	         }

	         os.flush();
	         os.close();
	         in.close();
	      } catch (IOException e) {
	         e.printStackTrace();
	      }
	   }
}
