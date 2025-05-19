"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function FileDetailPage({ params }: { params: { Id: string } }) {
  const [file, setFile] = useState({});

  const getfile = async () => {
    const response = await fetch(`/api/files/${params.Id}`);
    setFile(response);
    return;
  };

  useEffect(() => {}, []);

  useEffect(() => {
    console.log("file", file);
  }, [file]);

  return (
    <div className="relative flex justify-center items-center align-center w-full h-full">
      <Image
        className="object-contain"
        // width={file.width}
        // height={file.height}
        fill
        src={file.url || "/placeholder.svg"}
        // alt={`Image ${file.public_id}`}
        // style={imgStyles}
        // version={version}
        // placeholderStyle="dark"
        // {...transformations}
      />
    </div>
  );
}
