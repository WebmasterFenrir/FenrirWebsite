import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function ImageCarousel() {
  return (
    <div className="flex justify-center w-full px-6 py-10 sm:px-10">
      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        className="w-full max-w-5xl"
      >
        <CarouselContent className="px-4 sm:px-6 lg:px-10">
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem
              key={index}
              className="basis-5/6 sm:basis-2/3 md:basis-1/2 lg:basis-1/3"
            >
              <div className="p-2 sm:p-3">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <span className="text-3xl font-bold">{index + 1}</span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
