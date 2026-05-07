import java.io.IOException;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.*;
import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

// Custom Writable to store sum and count
class WeatherWritable implements Writable {
    public double tempSum;
    public double dewSum;
    public double windSum;
    public int count;

    public WeatherWritable() {}

    public WeatherWritable(double t, double d, double w, int c) {
        tempSum = t;
        dewSum = d;
        windSum = w;
        count = c;
    }

    public void write(DataOutput out) throws IOException {
        out.writeDouble(tempSum);
        out.writeDouble(dewSum);
        out.writeDouble(windSum);
        out.writeInt(count);
    }

    public void readFields(DataInput in) throws IOException {
        tempSum = in.readDouble();
        dewSum = in.readDouble();
        windSum = in.readDouble();
        count = in.readInt();
    }
}

// Mapper
public class WeatherMapper extends Mapper<LongWritable, Text, Text, WeatherWritable> {
    private final static Text keyOut = new Text("weather");

    public void map(LongWritable key, Text value, Context context)
            throws IOException, InterruptedException {

        String[] fields = value.toString().split("\\s+");

        if (fields.length == 4) {
            double temp = Double.parseDouble(fields[1]);
            double dew = Double.parseDouble(fields[2]);
            double wind = Double.parseDouble(fields[3]);

            context.write(keyOut, new WeatherWritable(temp, dew, wind, 1));
        }
    }
}

// Reducer
class WeatherReducer extends Reducer<Text, WeatherWritable, Text, Text> {

    public void reduce(Text key, Iterable<WeatherWritable> values, Context context)
            throws IOException, InterruptedException {

        double tempSum = 0, dewSum = 0, windSum = 0;
        int count = 0;

        for (WeatherWritable val : values) {
            tempSum += val.tempSum;
            dewSum += val.dewSum;
            windSum += val.windSum;
            count += val.count;
        }

        double avgTemp = tempSum / count;
        double avgDew = dewSum / count;
        double avgWind = windSum / count;

        context.write(key, new Text(
                "AvgTemp=" + avgTemp +
                ", AvgDew=" + avgDew +
                ", AvgWind=" + avgWind));
    }
}

// Driver
public class WeatherDriver {
    public static void main(String[] args) throws Exception {

        Configuration conf = new Configuration();
        Job job = Job.getInstance(conf, "Weather Average");

        job.setJarByClass(WeatherDriver.class);

        job.setMapperClass(WeatherMapper.class);
        job.setCombinerClass(WeatherReducer.class);
        job.setReducerClass(WeatherReducer.class);

        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(WeatherWritable.class);

        FileInputFormat.addInputPath(job, new Path(args[0]));
        FileOutputFormat.setOutputPath(job, new Path(args[1]));

        System.exit(job.waitForCompletion(true) ? 0 : 1);
    }
}