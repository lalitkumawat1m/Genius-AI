"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Music, Send } from "lucide-react";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Loader } from "@/components/loader";
import { Empty } from "@/components/empty";
import { useProModal } from "@/hooks/use-pro-modal";


import { formSchema } from "./constants";

const MusicPage = () => {
  const proModal = useProModal();
  const router = useRouter();
  const [music, setMusic] = useState<string>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    }
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setMusic(undefined);

      const response = await axios.post('/api/music', values);
      console.log(response)

      const result = response.data;        // the full response
      const files = result?.data;          // this is the inner array you're looking for

      const mp4 = files?.[0]?.[0]?.name;
      const wav = files?.[1]?.name;

      const baseURL = "https://facebook-musicgen.hf.space/file=";
      const wavURL = wav ? baseURL + encodeURIComponent(wav) : undefined;
      const mp4URL = mp4 ? baseURL + encodeURIComponent(mp4) : undefined;

      if (wavURL || mp4URL) {
        const publicUrl = wavURL || mp4URL;
        const proxyUrl = `/api/proxy-audio?url=${encodeURIComponent(publicUrl!)}`;
        setMusic(proxyUrl);
        console.log("publicUrl:", publicUrl);
      } else {
        console.error("No music file found");
      }
      form.reset();
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
        title="Music Generation"
        description="Turn your prompt into music."
        icon={Music}
        iconColor="text-emerald-500"
        bgColor="bg-emerald-500/10"
      />
      <div className="px-4 lg:px-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="
              rounded-lg 
              border 
              w-full 
              p-4 
              px-3 
              md:px-6 
              focus-within:shadow-sm
              grid
              grid-cols-12
              gap-2
            "
          >
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-10">
                  <FormControl className="m-0 p-0">
                    <Input
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      disabled={isLoading}
                      placeholder="Piano solo"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button className="col-span-12 lg:col-span-2 w-full" type="submit" disabled={isLoading} size="icon">
              Generate
            </Button>
          </form>
        </Form>
        {isLoading && (
          <div className="p-20">
            <Loader />
          </div>
        )}
        {!music && !isLoading && (
          <Empty label="No music generated." />
        )}
        {music && (
          <audio controls className="w-full mt-8">
            <source src={music} type={music.endsWith(".wav") ? "audio/wav" : "audio/mp4"} />
          </audio>
        )}
      </div>
    </div>
  );
}

export default MusicPage;