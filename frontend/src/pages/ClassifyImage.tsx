import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, UploadCloud, AlertTriangle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Prediction {
  label: string;
  confidence: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background border rounded-md shadow-lg">
        <p className="font-bold">{label}</p>
        <p className="text-primary">{`Confidence: ${(payload[0].value * 100).toFixed(1)}%`}</p>
      </div>
    );
  }
  return null;
};

const ClassifyImage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setPredictions([]);
      setError(null);
    }
  };

  const handleClassify = async () => {
    if (!selectedFile) return setError("Please select a file first.");
    setIsLoading(true);
    setError(null);
    setPredictions([]);
    
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/classify-image", {
        method: "POST",
        body: formData,
      });

      console.log("Response:", response);
      if (!response.ok) {
        let errorMsg = "Prediction model is currently unavailable.";
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log("Prediction data:", data);

      if (data.error || !data.predictions) throw new Error(data.error || "Invalid response.");
      const sortedPredictions = [...data.predictions].sort((a, b) => b.confidence - a.confidence);
      setPredictions(sortedPredictions);

      toast({
        title: "Analysis Complete",
        description: `Top Prediction: ${sortedPredictions[0].label}`,
      });

    } catch (err: any) {
      console.error("Classification error:", err);
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const topPrediction = predictions.length > 0 ? predictions[0] : null;

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start p-4">
      {/* Upload Image */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center"><UploadCloud className="mr-2" /> Upload Image</CardTitle>
            <CardDescription>Select an image of the skin condition for AI analysis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="picture">Picture File</Label>
              <Input id="picture" type="file" onChange={handleFileChange} accept="image/*" disabled={isLoading} />
            </div>
            {preview && (
              <motion.div layoutId="image-preview" className="mt-4 border-4 border-dashed rounded-lg p-2 flex justify-center items-center h-64 bg-muted/30">
                <img src={preview} alt="Preview" className="rounded-md max-h-full object-contain" />
              </motion.div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleClassify} disabled={!selectedFile || isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : "Analyze Image"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Results */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Card className="shadow-xl min-h-[520px]">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>View the model's predictions and confidence levels.</CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div key="loader" className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p>Processing image, please wait...</p>
                </motion.div>
              )}
              {error && !isLoading && (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Analysis Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
              {predictions.length > 0 && !isLoading && topPrediction && (
                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="text-center p-4 border-2 border-primary/50 rounded-lg bg-primary/10">
                    <p className="text-sm font-medium text-primary uppercase tracking-wider">Top Prediction</p>
                    <p className="text-3xl font-bold text-primary">{topPrediction.label}</p>
                    <p className="text-2xl font-light text-muted-foreground">{(topPrediction.confidence * 100).toFixed(1)}% Confidence</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Confidence Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={predictions} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                        <YAxis type="category" dataKey="label" width={120} tick={{ fontSize: 10 }} interval={0} />
                        <Tooltip cursor={{ fill: 'rgba(200, 200, 200, 0.2)' }} content={<CustomTooltip />} />
                        <Bar dataKey="confidence" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Disclaimer</AlertTitle>
                    <AlertDescription>This is an AI-generated prediction, not a medical diagnosis. Please consult a qualified healthcare professional.</AlertDescription>
                  </Alert>
                </motion.div>
              )}
              {!isLoading && !error && predictions.length === 0 && (
                <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-64 text-muted-foreground text-center">
                  <Info className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p>Your analysis results will appear here.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ClassifyImage;
