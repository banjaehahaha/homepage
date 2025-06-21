import Image from "next/image";

export default function Home() {
  return (

// 어바웃페이지에 어울리는 디자인으로 코드 짜줘
    <div style={{ padding: "20px", textAlign: "center" }}>
    <h1 style={{ color: "#4A90E2" }}>About Us</h1>
    <p style={{ fontSize: "18px", color: "#555" }}>
      Welcome to our about page! Here we share our story and vision.
    </p>
    <Image
      src="/images/about-image.jpg"
      alt="About Image"
      width={500}
      height={300}
      style={{ borderRadius: "10px", marginBottom: "20px" }}
    />
<div><b>hi</b></div>
    <p style={{ fontSize: "16px", color: "#777" }}>
      We are committed to providing the best service possible. Our team is dedicated to making your experience memorable.
    </p>
    <div style={{ marginTop: "20px" }}>
      <a href="/contact" style={{ color: "#4A90E2", textDecoration: "underline" }}>
        Contact Us
      </a>
    </div>
  </div>
  );
}
