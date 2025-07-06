"use client";

import * as z from "zod";
import axios from "axios";
import Image from "next/image";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, SquarePen } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Loader } from "@/components/loader";
import { Empty } from "@/components/empty";

import { useProModal } from "@/hooks/use-pro-modal";

import { formSchema } from "./constants";

const PhotoEditorPage = () => {
  const proModal = useProModal();
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    }
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {

    if (!imageFile) {
      toast.error("Please upload an image");
      return;
    }

    try {
      setPhotos([]);

      const formData = new FormData();
      formData.append("prompt", values.prompt);
      formData.append("image", imageFile);

      const res = await axios.post("/api/image-editor", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // ✅ force proper content-type
        },
      });


      // const data = await res.json();
      setPhotos([res.data.url]);
    } catch (error: any) {
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("Something went wrong.");
      }
      console.log(error);
    } finally {
      router.refresh();
    }

  }

  return (

    <div>
      <Heading
        title="AI Image Editor"
        description="Just Type It. We’ll Edit It."
        icon={SquarePen}
        iconColor="text-pink-700"
        bgColor="bg-pink-700/10"
      />

      <div className="px-4 lg:px-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="
          rounded-lg border w-full p-4 px-3 md:px-6
          focus-within:shadow-sm grid grid-cols-12 gap-2
        "
          >
            {/* 📂  Image upload  */}
            <div className="col-span-12 lg:col-span-3 flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                disabled={isLoading}
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              {/* <Upload className="h-4 w-4 text-muted-foreground" /> */}
            </div>

            {/* ✏️  Prompt  */}
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-7">
                  <FormControl className="m-0 p-0">
                    <Input
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      disabled={isLoading}
                      placeholder="E.g. 'Make it look like Van Gogh painted this'"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* ▶️  Submit  */}
            <Button
              className="col-span-12 lg:col-span-2 w-full"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Processing…" : "Edit Image"}
            </Button>
          </form>
        </Form>

        {isLoading && (
          <div className="p-20">
            <Loader />
          </div>
        )}

        {photos.length === 0 && !isLoading && <Empty label="No image edited." />}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
          {photos.map((src) => (
            <Card key={src} className="rounded-lg overflow-hidden">
              <div className="relative w-full" style={{ height: "auto" }}>
                <Image
                  src={src}
                  alt="Generated"
                  width={1024}
                  height={1024}
                  className="w-full h-auto object-contain"

                />
              </div>
              <CardFooter className="p-2">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = src;
                    link.download = "kontext.png";
                    link.click();
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

}

export default PhotoEditorPage;