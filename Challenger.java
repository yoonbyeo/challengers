public class Challenger {
    private String name;

    public Challenger(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return "Challenger{name='" + name + "'}";
    }
}
