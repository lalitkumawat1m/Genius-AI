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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
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
    },
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
          "Content-Type": "multipart/form-data",
        },
      });

      setPhotos([res.data.url]);
    } catch (error: any) {
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("Something went wrong.");
      }
      console.error(error);
    } finally {
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
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
            className="bg-white/5 backdrop-blur-sm border border-muted rounded-xl p-6 space-y-4 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4 flex items-center">
                <Input
                  type="file"
                  accept="image/*"
                  disabled={isLoading}
                  onChange={(e) =>
                    setImageFile(e.target.files?.[0] || null)
                  }
                />
              </div>

              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="md:col-span-6">
                    <FormControl>
                      <Input
                        placeholder="E.g. 'Make it look like Van Gogh painted this'"
                        {...field}
                        disabled={isLoading}
                        className="focus-visible:ring-pink-600"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <Button
                  type="submit"
                  className="w-full h-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Edit Image"}
                </Button>
              </div>
            </div>
          </form>
        </Form>

        {isLoading && (
          <div className="p-20 flex justify-center">
            <Loader />
          </div>
        )}

        {!isLoading && photos.length === 0 && (
          <Empty label="No image edited." />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {photos.map((src) => (
            <Card
              key={src}
              className="overflow-hidden rounded-2xl border shadow-lg hover:shadow-xl transition w-full max-w-xl mx-auto"
            >
              <div className="relative aspect-[4/3] w-full h-auto">
                <Image
                  src={src}
                  alt="Edited Image"
                  fill
                  className="object-cover"
                />
              </div>
              <CardFooter className="p-6">
                <Button
                  variant="secondary"
                  className="w-full text-base py-2.5"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = src;
                    link.download = "kontext.png";
                    link.click();
                  }}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download
                </Button>
              </CardFooter>
            </Card>

          ))}
        </div>
      </div>
    </div>
  );
};

export default PhotoEditorPage;
