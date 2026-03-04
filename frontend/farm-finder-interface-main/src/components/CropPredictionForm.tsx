import { useState } from "react";
import { z } from "zod";
import { Loader2, Sprout, Leaf, Droplets, Thermometer, CloudRain, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { predictCrop } from "@/api/cropApi";

const cropSchema = z.object({
  nitrogen: z.number().min(0, "Must be ≥ 0").max(140, "Must be ≤ 140"),
  phosphorus: z.number().min(5, "Must be ≥ 5").max(145, "Must be ≤ 145"),
  potassium: z.number().min(5, "Must be ≥ 5").max(205, "Must be ≤ 205"),
  temperature: z.number().min(0, "Must be ≥ 0°C").max(60, "Must be ≤ 60°C"),
  humidity: z.number().min(0, "Must be ≥ 0%").max(100, "Must be ≤ 100%"),
  ph: z.number().min(0, "Must be ≥ 0").max(14, "Must be ≤ 14"),
  rainfall: z.number().min(0, "Must be ≥ 0mm").max(500, "Must be ≤ 500mm"),
});

type CropFormData = z.infer<typeof cropSchema>;

const fields: { key: keyof CropFormData; label: string; unit: string; icon: React.ReactNode; min: number; max: number; step: number }[] = [
  { key: "nitrogen", label: "Nitrogen (N)", unit: "kg/ha", icon: <FlaskConical className="h-4 w-4" />, min: 0, max: 140, step: 1 },
  { key: "phosphorus", label: "Phosphorus (P)", unit: "kg/ha", icon: <FlaskConical className="h-4 w-4" />, min: 5, max: 145, step: 1 },
  { key: "potassium", label: "Potassium (K)", unit: "kg/ha", icon: <FlaskConical className="h-4 w-4" />, min: 5, max: 205, step: 1 },
  { key: "temperature", label: "Temperature", unit: "°C", icon: <Thermometer className="h-4 w-4" />, min: 0, max: 60, step: 0.5 },
  { key: "humidity", label: "Humidity", unit: "%", icon: <Droplets className="h-4 w-4" />, min: 0, max: 100, step: 1 },
  { key: "ph", label: "pH Value", unit: "", icon: <Leaf className="h-4 w-4" />, min: 0, max: 14, step: 0.1 },
  { key: "rainfall", label: "Rainfall", unit: "mm", icon: <CloudRain className="h-4 w-4" />, min: 0, max: 500, step: 1 },
];

const MOCK_CROPS = ["Rice", "Wheat", "Maize", "Chickpea", "Lentil", "Cotton", "Jute", "Coffee", "Mango", "Banana", "Coconut", "Papaya", "Watermelon", "Muskmelon", "Apple", "Orange", "Grapes"];

export default function CropPredictionForm() {
  const [formValues, setFormValues] = useState<Record<string, number>>({
    nitrogen: 90,
    phosphorus: 42,
    potassium: 43,
    temperature: 21,
    humidity: 82,
    ph: 6.5,
    rainfall: 202,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSliderChange = (key: string, value: number) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleInputChange = (key: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setFormValues((prev) => ({ ...prev, [key]: numValue }));
    }
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    const raw: Record<string, number> = {};
    for (const f of fields) {
      raw[f.key] = formValues[f.key] || f.min;
    }

    const parsed = cropSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        const key = err.path[0] as string;
        fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const crop = await predictCrop(parsed.data);
      setResult(crop);
    } catch (error) {
      setErrors({ nitrogen: "Prediction failed. Please try again." });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="border-border/60 shadow-xl backdrop-blur-sm bg-card/95">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {fields.map((f) => {
              const currentValue = formValues[f.key] ?? f.min;
              
              return (
                <div key={f.key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                      <span className="text-primary">{f.icon}</span>
                      {f.label}
                      {f.unit && <span className="text-muted-foreground text-xs">({f.unit})</span>}
                    </Label>
                  </div>
                  
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <Slider
                        value={[currentValue]}
                        onValueChange={(value) => handleSliderChange(f.key, value[0])}
                        min={f.min}
                        max={f.max}
                        step={f.step}
                        className="w-full"
                      />
                    </div>
                    
                    <Input
                      type="number"
                      step={f.step}
                      min={f.min}
                      max={f.max}
                      value={currentValue.toFixed(f.step < 1 ? 1 : 0)}
                      onChange={(e) => handleInputChange(f.key, e.target.value)}
                      className="w-20 text-center bg-background/60 text-sm font-semibold"
                    />
                  </div>
                  
                  {errors[f.key] && (
                    <p className="text-xs text-destructive">{errors[f.key]}</p>
                  )}
                </div>
              );
            })}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sprout className="mr-2 h-5 w-5" />
                  Predict Crop
                </>
              )}
            </Button>
          </form>

          {result && (
            <div className="mt-8 animate-fade-in-up">
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-6 text-center">
                <p className="text-sm font-medium text-muted-foreground mb-2">Recommended Crop</p>
                <div className="flex items-center justify-center gap-3">
                  <Sprout className="h-8 w-8 text-primary" />
                  <span className="text-3xl font-display font-bold text-primary">{result}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Based on your soil and environmental parameters
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
